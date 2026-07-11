# Claude Context — songs-names-analyzer (root / monorepo overview)

Toto je nadřazený kontextový soubor pro celý projekt. Detailní kontext ke
konkrétní části je v `backend/README-CLAUDE.md` a `frontend/README-CLAUDE.md`
— tenhle soubor slouží k rychlému přehledu, jak spolu obě části souvisí, a
k věcem, které se týkají projektu jako celku (repo struktura, nasazení).

## O projektu

Web aplikace pro sledování a analýzu zpívaných písní (obecně — např. na
bohoslužbách, ale použitelné pro jakýkoliv kontext). Backend eviduje písně a
jejich historii zpívání, frontend to vizualizuje.

## Struktura repozitáře (monorepo)

```
songs-names-analyzer/
├── backend/    → NestJS + TypeScript + Prisma + SQLite (viz backend/README-CLAUDE.md)
│   └── data/   → zálohovaná zdrojová data (CSV/xlsx + číselník názvů písní)
├── frontend/   → React + TypeScript + Vite (viz frontend/README-CLAUDE.md)
└── README-CLAUDE.md  → tento soubor
```

Historie: projekt původně vznikl jako dva samostatné GitHub repozitáře
(`songs-analyzer-backend`, `songs-analyzer-frontend`). Dne 2026-07-11 byly
sloučeny do jednoho monorepa `songs-names-analyzer`. Staré repozitáře na
GitHubu zatím zůstávají beze změny (nejsou smazané), ale už se nepoužívají.

## Pravidlo projektu

Veškerý kód, názvy komponent/tabulek/sloupců/proměnných i souborů musí být
striktně v angličtině. Konverzace s uživatelem může být v češtině. Textový
obsah UI (např. zprávy pro uživatele appky) může být česky, jde jen o kód.

## Prostředí (WSL)

Vývoj probíhá ve WSL (Ubuntu Linux pod Windows). Repo žije na WSL
filesystému:

```
/home/josefprochazka/repos-ubuntu/songs-names-analyzer
```

- Nepoužívat `~` v cestách (v použitém Bash nástroji se rozbaluje na Windows
  profil, ne WSL home) — pohybovat se relativně vůči `pwd`.
- `cd` do UNC cesty (`\\wsl.localhost\...`) nefunguje v `cmd.exe` — pro
  přístup z Windows strany použít PowerShell nebo WSL terminál.
- Projekt zůstává na WSL filesystému (`/home/...`), ne na `/mnt/c/...`.

## PRAVIDLO: Claude appku sám nespouští

Uživatel má vlastní otevřený WSL terminál a appku (dev server, build, atd.)
si spouští **sám**. Claude appku nikdy sám nespouští ani netestuje spuštěním
(ani přes Bash nástroj, ani přes PowerShell) — role je jasně dělená: Claude
píše/upravuje kód, uživatel ho spouští a testuje. Pokud je potřeba něco
ověřit v běhu, Claude řekne uživateli přesně jaký příkaz a kde spustit,
nespouští ho za něj.

## Nasazení — HOTOVO, infrastruktura běží

Appka je nasazená zdarma na třech propojených službách (všechny napojené na
GitHub repo, auto-deploy při push na `main`):

| Vrstva | Služba | Adresa / stav |
|---|---|---|
| Frontend | **Vercel** (root dir `frontend`) | běží, `*.vercel.app` |
| Backend | **Render** (root dir `backend`, free tier) | běží, `https://songs-names-analyzer.onrender.com` (zatím vrací jen defaultní "Hello World!", žádná DB logika) |
| Databáze | **Turso** (SQLite-kompatibilní, persistentní free tier) | databáze založená, zatím nenapojená na kód |

Render env proměnné `TURSO_DATABASE_URL` a `TURSO_AUTH_TOKEN` jsou už
nastavené v Render dashboardu (čekají, až je Prisma v kódu začne používat).
Render build/start command: `npm install && npm run build` / `npm run
start:prod`.

Poznámka k SQLite: lokálně (u vývojáře) běží normální SQLite soubor, v
produkci (Render) se napojí na Turso — kvůli nepersistentnímu disku na free
hostingu. Tohle napojení v kódu (Prisma adaptér pro Turso) ještě není
hotové, je to jeden z dalších kroků.

## Aktuální stav (k 2026-07-11, večer)

- [x] Monorepo `songs-names-analyzer` na GitHubu
- [x] `frontend` — nasazený na Vercelu, dočasná "hello wife" stránka: růžový
      unicorn placeholder s blikajícím textem "Ahoj bejby! Brzy tady uvidíš
      data všech písní. Těš se!" (dočasný obsah pro manželku, přepíše se až
      začneme dělat skutečné UI se statistikami)
- [x] `backend` — nasazený na Renderu, běží holá NestJS kostra (bez DB)
- [x] Turso databáze založená, env proměnné na Renderu připravené
- [x] Zdrojová data zálohovaná v `backend/data/` (viz backend README) —
      vyčištěný CSV/xlsx export (datum + píseň) + číselník správných názvů
      písní, obojí commitnuté v gitu jako trvalá záloha
- [ ] **DALŠÍ KROK: Prisma + SQLite v backendu** (viz backend/README-CLAUDE.md
      pro detailní rozpis)
- [ ] Napojení Prismy na Turso v produkci
- [ ] Import dat z `backend/data/` do databáze
- [ ] Backend API endpoint(y) vracející statistiky písní
- [ ] Frontend — nahradit unicorn placeholder skutečným UI se
      statistikami/grafy napojeným na backend API
- [ ] Později: automatický import přímo z Google Sheetu (ať se data nemusí
      přidávat ručně)

## Plán práce — pořadí dalších kroků

1. Prisma + SQLite v backendu (schema `Song`/`SongHistory`/`UnknownSong`,
   migrace, `PrismaService`/modul)
2. Import CSV z `backend/data/` do databáze
3. Backend endpoint(y) pro statistiky
4. Napojit produkční Prismu na Turso (env proměnné už čekají na Renderu)
5. Frontend UI se statistikami/grafy místo unicorn placeholderu
6. Ověřit, že celé to (FE+BE+DB) funguje živě
7. Automatický import z Google Sheetu (budoucnost)
