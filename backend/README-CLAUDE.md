# Claude Context — songs-analyzer-backend

Tento soubor je moje průběžná paměť/kontext k projektu. Aktualizuji ho po každém
větším kroku, aby si další session (nebo já po kontext-resetu) uměla rychle
zorientovat.

## O projektu

Backend, který zpracovává statistiky písní zpívaných na kostelních bohoslužbách
(jaké písně se hrály, kdy, případně neznámé/nerozpoznané záznamy). Zdroj dat má
být zatím Google Sheets, ale to se řeší až později — teď se buduje čistě DB vrstva.

## Tech stack

- **NestJS** (v11) + **TypeScript**
- **Prisma ORM** + **SQLite** (lokální soubor, žádný externí DB server)
- Later: napojení na Google Sheets (zatím neřešeno)

## Pravidlo projektu

**Veškerý kód, názvy tabulek, sloupců, proměnných i souborů musí být striktně
v angličtině.** Žádná čeština v kódu, komentářích, ani v DB schématu. Konverzace
s uživatelem může být v češtině, ale vše, co jde do repozitáře, je anglicky.

## Prostředí — DŮLEŽITÁ POZNÁMKA (WSL vs Windows cesty)

Uživatel pracuje na Windows notebooku, ale kóduje v **WSL (Ubuntu)**, protože
potřebuje Linux prostředí pro TS/Node vývoj. Projekt fyzicky žije na WSL
filesystému:

```
\\wsl.localhost\Ubuntu\home\josefprochazka\repos-ubuntu\songs-names-analyzer\backend
```

(Pozn.: projekt byl 2026-07-11 sloučen s frontendem do jednoho monorepa
`songs-names-analyzer` — viz `../README-CLAUDE.md` pro celkový přehled.)

Zjištěné problémy a jak je řešit:

- **`cd` do UNC cesty nefunguje v `cmd.exe`** — UNC cesty (`\\wsl.localhost\...`)
  nejsou v classic cmd.exe podporované jako current directory, spadne to defaultně
  do `C:\Windows`. Pro navigaci z Windows strany používat radši **PowerShell**
  (ten UNC cesty jako cwd zvládá), nebo rovnou WSL terminál.
- **`~` (tilda) se v tomto Bash nástroji (Git Bash) NEROZBALUJE na WSL home**,
  ale na **Windows profil** (`C:\Users\josef.prochazka`). Použití `~/repos`
  omylem vytvořilo složku na Windows disku místo ve WSL! Ponaučení:
  **nikdy nepoužívat `~` v cestách v tomto prostředí** — vždy pracovat
  s relativní cestou vůči aktuálnímu `pwd`, nebo s plnou UNC/explicitní cestou.
- Aktuální pracovní adresář (`pwd`) při práci na tomto projektu by měl být vždy
  přímo `.../repos-ubuntu/songs-names-analyzer/backend` — ověřovat přes `pwd`
  na začátku session, ne spoléhat na `cd ~/...`.
- Projekty se drží striktně na WSL filesystému (`/home/...`), NE na
  `/mnt/c/...` (Windows disk) — kvůli výkonu (nativní ext4 vs. 9p protokol
  přes Windows mount).

## PRAVIDLO: Claude appku sám nespouští

Uživatel má vlastní otevřený WSL terminál a appku (dev server, build, atd.)
si spouští **sám**. Claude appku nikdy sám nespouští ani netestuje spuštěním
(ani přes Bash nástroj, ani přes PowerShell) — role je jasně dělená: Claude
píše/upravuje kód, uživatel ho spouští a testuje. Pokud je potřeba něco
ověřit v běhu, Claude řekne uživateli přesně jaký příkaz a kde spustit,
nespouští ho za něj.

## Aktuální stav (k 2026-07-11, večer)

- [x] Čistá kostra NestJS projektu, součást monorepa `songs-names-analyzer`
- [x] Založen tento `README-CLAUDE.md`
- [x] **Nasazeno na Render** (free tier, root dir `backend`, auto-deploy z
      `main`) — `https://songs-names-analyzer.onrender.com`. Zatím jede jen
      holá kostra (defaultní "Hello World!" na `/`), žádná DB logika.
- [x] Build/start command na Renderu: `npm install && npm run build` /
      `npm run start:prod`
- [x] **Turso databáze založená** (SQLite-kompatibilní, persistentní free
      tier — řeší problém, že Render má nepersistentní disk). Env proměnné
      `TURSO_DATABASE_URL` a `TURSO_AUTH_TOKEN` už jsou nastavené v Render
      dashboardu, ale kód je zatím nepoužívá.
- [x] **Zdrojová data zálohovaná** v `backend/data/`:
      - `songs-source-06-2026.xlsx` — vyčištěný seznam (datum, píseň), uživatel
        to ručně zpracoval z rozházeného Google Sheetu (3 sloupce písní,
        nekonzistentní oddělovače — čárka/středník/nový řádek, viz historie
        konverzace pro detaily o té messy struktuře)
      - `song-names-dictionary.txt` — číselník správných/kanonických názvů
        písní pro kontrolu/matchování při importu
      - `.gitignore` upraven o `*:Zone.Identifier` (Windows artefakt ze
        stahování souborů, nekomitovat)
- [x] **Prisma + SQLite hotovo** (2026-07-13): schema `Song` / `SongHistory`
      (FK na `Song`) / `UnknownSong`, migrace vytvořené a aplikované, lokální
      DB soubor `backend/prisma/dev.db` (v `.gitignore`, necommitovaný)
- [x] **Import dat hotov**: `backend/scripts/import-data.ts` (spouští se přes
      `npm run import:data`) — načte `song-names-dictionary.txt` → naplní
      `Song`, načte `songs-source-06-2026.xlsx` → pro každý řádek normalizuje
      název (bez diakritiky, lowercase) a napáruje na `Song`; co se nenapáruje,
      jde do `UnknownSong`. Po doplnění chybějících názvů do dictionary.txt a
      re-importu: **103 písní, 583 řádků historie, 0 unknown**.
- [ ] **DALŠÍ KROK: `PrismaModule` + `PrismaService` v NestJS**, zaregistrovat
      v `AppModule` (zatím appka DB vůbec nepoužívá za běhu, jen import skript)
- [ ] API endpoint(y) pro statistiky písní
- [ ] Napojení Prismy na Turso pro produkci (Render)
- [ ] Google Sheets integrace (zatím neřešeno, plánováno na později)

## Zjištěné zádrhely při zakládání Prisma (pro příště)

- `npx prisma init` defaultně nainstaluje **nejnovější Prisma (v7)**, která
  pro SQLite vyžaduje "driver adapter" a generuje ESM klienta
  (`import.meta.url`) — zbytečně komplikované pro tenhle jednoduchý projekt.
  **Řešení: používáme Prisma 5** (`prisma`/`@prisma/client` `^5.22.0`),
  klasický generator `provider = "prisma-client-js"`, žádný `prisma.config.ts`.
- Prisma 5 vyžaduje `url = env("DATABASE_URL")` přímo v `datasource` bloku
  ve `schema.prisma` (na rozdíl od v7, kde to šlo přes config soubor).
- Relativní cesta v `DATABASE_URL="file:./dev.db"` (v `.env`) se resolvuje
  **vůči složce, kde leží `schema.prisma`** (tzn. `prisma/dev.db`), ne vůči
  `backend/` nebo cwd terminálu — snadno se splete.
- Bash nástroj (Windows/Git Bash) neumí spustit `npx`/`npm` na UNC cestě
  (`\\wsl.localhost\...`) — tyhle příkazy musí spouštět uživatel sám ve svém
  WSL terminálu (viz pravidlo níže), Claude jen upravuje soubory.

## Budoucí kroky (zatím neimplementováno)

- `PrismaModule`/`PrismaService` v NestJS (`PrismaService extends PrismaClient`,
  `OnModuleInit`), zaregistrovat do `AppModule`
- Endpointy / služby pro statistiky (nejčastější písně, historie podle data, ...)
- Google Sheets integrace — čtení dat o zpívaných písních
- Napojení produkční Prismy na Turso (env proměnné na Renderu už čekají)
- Zpracování budoucích `UnknownSong` záznamů — flow na dohledání/přiřazení
