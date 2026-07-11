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
├── frontend/   → React + TypeScript + Vite (viz frontend/README-CLAUDE.md)
└── README-CLAUDE.md  → tento soubor
```

Historie: projekt původně vznikl jako dva samostatné GitHub repozitáře
(`songs-analyzer-backend`, `songs-analyzer-frontend`). Dne 2026-07-11 byly
sloučeny do jednoho monorepa `songs-names-analyzer`, protože jde reálně o
jeden produkt a monorepo je jednodušší na správu pro sólo vývoj (jeden zdroj
pravdy, nasazovací platformy typicky umí nastavit "root directory" pro
backend i frontend zvlášť z jednoho repa). Původní git historie (jen pár
skeleton commitů) byla při sloučení zahozena — nebylo co ztratit.

Staré repozitáře `songs-analyzer-backend` a `songs-analyzer-frontend` na
GitHubu zatím zůstávají beze změny (nejsou smazané), ale už se nepoužívají —
veškerá další práce probíhá zde.

## Pravidlo projektu

Veškerý kód, názvy komponent/tabulek/sloupců/proměnných i souborů musí být
striktně v angličtině. Konverzace s uživatelem může být v češtině.

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

## Nasazení (plánováno, zatím neřešeno)

Cíl: nasadit zdarma, aby appka měla veřejnou adresu.

- Frontend (Vite/React): typicky Vercel nebo Netlify (free tier, snadné,
  vlastní subdoména).
- Backend (NestJS): např. Render nebo Railway (free tier) — **pozor na
  SQLite**: většina free hostingů má nepersistentní filesystem, SQLite
  soubor by se při restartu/redeployi ztratil. Tohle je potřeba doladit až
  budeme řešit nasazení (buď persistent disk, nebo přejít na hostovanou DB).
- Obě služby lze nasadit z jednoho monorepa nastavením "root directory" na
  `backend/` resp. `frontend/` na dané platformě.

## Aktuální stav (2026-07-11)

- [x] Sloučeno do jednoho monorepa `songs-names-analyzer`
- [x] `backend/` — čistá NestJS kostra, README-CLAUDE.md založen, Prisma
      zatím NEnainstalována (čeká na pokyn)
- [x] `frontend/` — čistá React+Vite+TS kostra, README-CLAUDE.md založen,
      žádný kód zatím neupravován
- [ ] Push tohoto monorepa na GitHub (`https://github.com/josefprochazka/songs-names-analyzer`)
- [ ] Prisma + SQLite v backendu
- [ ] Úprava `App.tsx` ve frontendu (Hello World, "Songs Analyzer")
- [ ] Nasazení (deployment) — zatím neřešeno
