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

## Aktuální stav (k 2026-07-11, večer)

- [x] Čistá kostra React + TypeScript + Vite + ESLint, součást monorepa
      `songs-names-analyzer`
- [x] Založen tento `README-CLAUDE.md`
- [x] **Nasazeno na Vercel** (free, root dir `frontend`, auto-deploy z
      `main` — push na GitHub → nový build během ~minuty)
- [x] `App.tsx`/`App.css` přepsané na **dočasnou "hello wife" stránku**:
      růžová unicorn karta s animovaným duhovým nadpisem "Ahoj bejby!",
      blikajícím textem "Brzy tady uvidíš data všech písní. Těš se!",
      padajícími emoji a srdíčky. Čistě zábavný placeholder pro manželku,
      **přepíše se** až budeme dělat skutečné UI se statistikami.
- [x] Opravena chyba: nadpis byl vertikálně useknutý kvůli zděděnému
      `line-height: 145%` z `:root` (v `index.css`) počítanému z 18px
      základního fontu — na 48px nadpisu to dělalo příliš nízký line-box.
      Fix: explicitní `line-height` přidán na `.rainbow-text`,
      `.unicorn-emoji`, `.bounce-text`, `.hearts` v `App.css`. Ponaučení:
      při vlastním `font-size` v komponentě vždy nastavit i vlastní
      `line-height`, nespoléhat na zděděnou hodnotu z `:root`.
- [ ] Skutečné UI pro statistiky/grafy (čeká na hotový backend + API)

## Plán práce — budoucí kroky

1. Počkat, až bude hotová Prisma/DB vrstva a API endpointy v backendu.
2. Nahradit unicorn placeholder skutečným UI: napojení na backend API,
   zobrazení statistik a grafů (nejčastější písně, historie podle data,
   přehled neznámých/nerozpoznaných záznamů — `UnknownSong`).
3. Ověřit, že produkční frontend (Vercel) správně volá produkční backend
   (Render) — bude potřeba nastavit backend URL jako env proměnnou.
