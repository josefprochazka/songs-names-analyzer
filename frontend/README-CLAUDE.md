# Claude Context — songs-analyzer-frontend

Tento soubor je moje průběžná paměť/kontext k projektu. Aktualizuji ho po každém
větším kroku, aby si další session (nebo já po kontext-resetu) uměla rychle
zorientovat.

## O projektu

React frontend pro vizualizaci statistik a grafů písní zpívaných na kostelních
bohoslužbách. Data bude brát z backendu — projekt `songs-analyzer-backend`
(NestJS + Prisma + SQLite), který žije vedle tohoto projektu ve stejné
`repos-ubuntu` složce.

## Tech stack

- **React**
- **TypeScript**
- **Vite**
- **ESLint**
- Závislosti nainstalované přes npm

## Pravidlo projektu

**Všechny texty v kódu, názvy komponent a proměnných musí být pouze
v angličtině.** Žádná čeština v kódu ani komentářích. Konverzace s uživatelem
může být česky, ale vše, co jde do repozitáře, je anglicky.

## Prostředí — DŮLEŽITÁ POZNÁMKA (WSL)

Vývoj probíhá **uvnitř WSL (Ubuntu Linux pod Windows)**. Uživatel má Windows
notebook, ale kóduje v Linuxovém prostředí WSL. Repozitáře jsou umístěné přímo
v Linuxové adresářové struktuře:

```
~/repos-ubuntu/songs-names-analyzer/backend
~/repos-ubuntu/songs-names-analyzer/frontend
```

(reálná plná cesta: `/home/josefprochazka/repos-ubuntu/...`, resp. z Windows
strany viditelná jako `\\wsl.localhost\Ubuntu\home\josefprochazka\repos-ubuntu\...`)

(Pozn.: projekt byl 2026-07-11 sloučen s backendem do jednoho monorepa
`songs-names-analyzer` — viz `../README-CLAUDE.md` pro celkový přehled.)

Jak se v tomto prostředí správně pohybovat, aby nevznikaly chyby v cestách:

- **Pohybovat se čistě linuxovými příkazy**, ne přes Windows cesty. Např. mezi
  backendem a frontendem přepínat pomocí `cd ../songs-analyzer-frontend` resp.
  `cd ../backend` (jsou to sourozenecké podsložky uvnitř monorepa
  `songs-names-analyzer/`).
- **Nepoužívat `~` (tildu) v cestách** — v Bash nástroji, který zde běží (Git
  Bash), se `~` nerozbaluje na WSL home, ale omylem na **Windows profil**
  (`C:\Users\josef.prochazka`). To už jednou způsobilo, že se složka vytvořila
  na špatném místě (na Windows disku místo ve WSL). Vždy raději ověřit `pwd` a
  pohybovat se relativně vůči aktuální poloze, nebo použít plnou cestu
  `/home/josefprochazka/repos-ubuntu/...`.
- **`cd` do UNC cesty (`\\wsl.localhost\...`) nefunguje v `cmd.exe`** — pokud
  je potřeba k projektu přistupovat z Windows strany (mimo tento nástroj),
  použít PowerShell nebo rovnou WSL terminál, ne classic cmd.exe.
- Projekty se drží striktně na WSL filesystému (`/home/...`), NE na
  `/mnt/c/...` — kvůli výkonu (nativní ext4 vs. pomalý mount přes Windows).
- Před jakoukoliv prací ověřit `pwd`, že jsem opravdu v
  `.../repos-ubuntu/songs-names-analyzer/frontend`, nespoléhat na
  zapamatovanou cestu z předchozí session.

## PRAVIDLO: Claude appku sám nespouští

Uživatel má vlastní otevřený WSL terminál a appku (dev server, build, atd.)
si spouští **sám**. Claude appku nikdy sám nespouští ani netestuje spuštěním
(ani přes Bash nástroj, ani přes PowerShell) — role je jasně dělená: Claude
píše/upravuje kód, uživatel ho spouští a testuje. Pokud je potřeba něco
ověřit v běhu, Claude řekne uživateli přesně jaký příkaz a kde spustit,
nespouští ho za něj.

## Aktuální stav (2026-07-11)

- [x] Čistá kostra React + TypeScript + Vite + ESLint vytvořená
- [x] Závislosti nainstalované přes npm
- [x] Projekt propojený s GitHub repozitářem
      (`https://github.com/josefprochazka/songs-analyzer-frontend`)
- [x] Založen tento `README-CLAUDE.md`
- [ ] Vyčištění Vite šablony, žádný kód zatím neupravován (čeká na další krok)

## Plán práce — budoucí kroky (zatím NEIMPLEMENTOVÁNO)

1. Vyčistit balast z výchozí Vite šablony a upravit `App.tsx`, aby zobrazoval
   "Hello World" s nadpisem "Songs Analyzer".
2. Připojení na backend API (`songs-analyzer-backend`).
3. Tvorba UI pro statistiky a grafy (nejčastější písně, historie podle data,
   přehled neznámých/nerozpoznaných záznamů — `UnknownSong`).

Poznámka: v tomto kroku se **žádný kód neprogramoval ani neupravoval** — pouze
byl založen tento kontextový soubor. Implementace začne až v dalším kroku na
explicitní pokyn.
