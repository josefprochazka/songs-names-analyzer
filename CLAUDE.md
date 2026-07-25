# Claude Context — songs-names-analyzer (root / monorepo overview)

Toto je nadřazený kontextový soubor pro celý projekt. Detailní kontext ke
konkrétní části je v `backend/CLAUDE.md` a `frontend/CLAUDE.md`
— tenhle soubor slouží k rychlému přehledu, jak spolu obě části souvisí, a
k věcem, které se týkají projektu jako celku (repo struktura, nasazení).

## O projektu

Web aplikace pro sledování a analýzu zpívaných písní (obecně — např. na
bohoslužbách, ale použitelné pro jakýkoliv kontext). Backend eviduje písně a
jejich historii zpívání, frontend to vizualizuje.

## Struktura repozitáře (monorepo)

```
songs-names-analyzer/
├── backend/    → NestJS + TypeScript + Prisma + SQLite (viz backend/CLAUDE.md)
│   └── data/   → zálohovaná zdrojová data (CSV/xlsx + číselník názvů písní)
├── frontend/   → React + TypeScript + Vite (viz frontend/CLAUDE.md)
└── CLAUDE.md  → tento soubor
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

### Poznámka: kde skutečně jsou data ted (2026-07-13)

Naimportovaná data (103 písní, 583 řádků historie) existují **jen lokálně**,
v jednom souboru `backend/prisma/dev.db` na disku vývojáře. Tenhle soubor:

- **není na GitHubu** — je schválně v `.gitignore` (je to binární DB soubor,
  ne zdrojový kód, necommituje se).
- **není na Turso** — Turso databáze je založená, ale kód se na ni ještě
  nepřipojuje (viz výše), takže je tam zatím prázdno.
- **skutečná záloha** je zdrojová data v `backend/data/` (dictionary.txt +
  xlsx), ta JSOU v gitu. Z nich se dá `dev.db` kdykoliv znovu vytvořit
  příkazem `npm run import:data` (v `backend/`), i kdyby se lokální DB
  soubor ztratil.

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
- [x] **Prisma + SQLite v backendu hotovo** (2026-07-13, viz
      backend/CLAUDE.md pro detailní rozpis a zádrhely)
- [x] **Import dat hotov** — 103 písní, 583 řádků historie, 0 unknown
      (`npm run import:data` v `backend/`)
- [x] **`PrismaModule`/`PrismaService` v NestJS** + backend endpoint
      `GET /songs` vracející seznam písní s počtem zazpívání (2026-07-24)
- [x] **Napojení Prismy na Turso v produkci hotovo** (2026-07-24, viz
      backend/CLAUDE.md pro detailní rozpis a zádrhely) — backend na
      Renderu teď čte/zapisuje do skutečné Turso databáze přes libSQL
      driver adapter, data (103 písní, 583 řádků historie) tam naimportovaná
- [x] **Frontend nahrazuje unicorn placeholder** — `App.tsx` teď fetchuje
      `GET /songs` a vypisuje seznam písní s počty zazpívání (2026-07-24)
- [x] **Ověřeno, že celé to (FE+BE+DB) funguje živě**: Vercel → Render →
      Turso, viz `https://songs-names-analyzer.vercel.app` (2026-07-24)
- [x] **Statistiky/Zpěvník UI hotovo** (2026-07-25) — dvě záložky:
      Statistiky (filtr období vč. posledního týdne, řazení podle počtu/
      naposledy zpíváno/abecedy, časová osa historie po rozkliknutí písně)
      a Zpěvník (abecední seznam všech písní ze zpěvníku KJ, vyhledávání
      bez ohledu na diakritiku, tlačítko na zkopírování přesného názvu).
- [ ] Google Sheets integrace — **plán obrácený oproti původní myšlence**,
      viz sekce "Plán: přidávání písní přes appku + sync do Sheets" níže.
- [ ] Kosmetika: pár duplicit/překlepů v `song-names-dictionary.txt`
      (např. "Základ Můj" vs "Základ můj", "Nemusím víc se bat" vs
      "se bát") — stejná píseň vede na dva řádky v seznamu
- [ ] Auto-deploy na Renderu historicky nefungoval spolehlivě kvůli buildu,
      který padal (viz backend/CLAUDE.md) — teď by měl auto-deploy na push
      fungovat, ale zatím to nebylo ověřeno na dalším běžném pushi
- [ ] **Flag na písně, co se nemají hrát** (nápad, 2026-07-25) — pár písní
      by chtěl uživatel označit, aby se v appce zobrazily červeně (přehled
      "tohle nehrát"). Řešení: nový sloupec `Song.doNotSing` (Boolean,
      migrace + ruční aplikace na Turso jako u předchozích migrací),
      promítnout do `GET /songs`, ve frontendu podmíněně obarvit název.
      Otevřená otázka: nastavovat ručně přes SQL, nebo přes UI (checkbox/
      tlačítko + update endpoint) — druhé zapadá do plánu formuláře na
      přidávání písní výše. Zatím neimplementováno.

## Plán práce — pořadí dalších kroků

1. ~~Prisma + SQLite v backendu~~ hotovo
2. ~~Import CSV z `backend/data/` do databáze~~ hotovo
3. ~~Backend endpoint(y) pro statistiky~~ hotovo
4. ~~Napojit produkční Prismu na Turso~~ hotovo
5. ~~Frontend UI napojené na backend API~~ hotovo (zatím jen prostý seznam,
   ne grafy)
6. ~~Ověřit, že celé to (FE+BE+DB) funguje živě~~ hotovo
7. ~~Skutečné UI se statistikami~~ hotovo (2026-07-25) — Statistiky +
   Zpěvník záložky, viz výše
8. **DALŠÍ KROK: přidávání písní přes appku + sync do Google Sheets**
   (viz sekce níže)

## Plán: přidávání písní přes appku + sync do Sheets

Původní myšlenka byla: appka čte z Google Sheetu (lidé zapisují do Sheetu,
appka to v noci naimportuje). Zavrhnuto — zdrojový Sheet je nepořádný (3
sloupce písní, nekonzistentní oddělovače), parsování by bylo křehké a řešilo
by se to samé co dřív s `song-names-dictionary.txt`.

**Nový plán (obrácený směr toku dat):**

1. Appka dostane formulář na přidání záznamu (datum + výběr písně).
   Výběr písně **není volný text** — je to autocomplete/dropdown ze
   stávajícího seznamu písní (stejná data co Zpěvník), takže odpadá
   celý problém s překlepy/neznámými písněmi. Appka se tím stává
   zdrojem pravdy místo Sheetu.
   - Pokud píseň v seznamu ještě není, jde ji rovnou z formuláře
     založit jako novou (dostane `id`, od té chvíle se nabízí v
     autocomplete i ostatním, sbírá si vlastní historii dat zpívání).
     `song-names-dictionary.txt` tím přestává být ručně udržovaný
     zdroj pravdy — Zpěvník roste organicky přímo z používání appky.
2. Backend endpoint uloží záznam rovnou do Turso (real-time, žádný
   import skript).
3. Zápis se promítne i do Google Sheetu přes Sheets API (`googleapis`
   balíček, service account s právem editace na konkrétní Sheet) —
   Sheet se stává jen zrcadlem/zálohou, appka do něj píše, nečte z něj.
   Řešit: automaticky při každém přidání vs. tlačítko "Synchronizovat"
   (asi obojí — auto sync + ruční tlačítko jako pojistka).
4. Jednorázový setup: založit Google Cloud service account, nasdílet
   mu cílový Sheet s právem na zápis, credentials uložit jako env
   proměnná na Renderu (podobně jako `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`).

Stav: **zatím jen nápad/diskuze (2026-07-25)**, ještě neimplementováno.

## Plán: záloha dat (DB backup + restore)

Motivace: teď je reálná záloha dat `backend/data/` v gitu (xlsx + dictionary).
Až appka přestane číst ze Sheetu a stane se zdrojem pravdy (viz plán výše),
tahle záloha zestárne a přestane sedět s obsahem DB. Potřeba nezávislá
záloha, ze které jde appku "znovu nahodit jako by se nic nestalo" — stačí
git (src/schema) + tahle záloha.

**Požadavky (zadání uživatele, 2026-07-25):**
- Obsahuje: seznam všech písní + celou historii zpívání (datum + píseň).
- Formát: jakýkoliv, hlavně ať jde rychle zase nahodit/refreshnout.
- Doručení: posílat na e-mail pravidelně, ideálně při každém uložení
  změny v DB.

**Zjištění (2026-07-25): Turso na tohle má vestavěný nativní mechanismus,
nemusíme si nic psát vlastního.** Je to SQLite-kompatibilní, takže funguje
klasický SQLite `.dump` přístup + Turso k tomu navíc nabízí platformní
zálohování:

1. **`.dump` — ruční/skriptovatelná záloha (tohle použít teď):**
   ```
   turso db shell songs-names-analyzer .dump > backup.sql
   ```
   Vygeneruje čistý SQL skript (CREATE TABLE + INSERT příkazy pro `Song`
   i `SongHistory`), který jde poslat jako přílohu mailem — malý textový
   soubor, žádný vlastní export/import formát/skript navíc.
2. **Restore — vytvořit novou DB a nahrát do ní dump:**
   ```
   turso db create nova-db
   turso db shell nova-db < backup.sql
   ```
   Pak přepojit `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` na Renderu na
   `nova-db` — appka běží se starými daty. Žádný vlastní restore skript
   není potřeba (na rozdíl od dřívější JSON-export úvahy).
3. **Turso Point-in-Time Restore (bonus, ne primární plán)** — Turso
   umí i sám o sobě vytvořit novou DB z historického stavu jiné DB:
   ```
   turso db create nova-db --from-db songs-names-analyzer --timestamp <cas>
   ```
   Je to jako průběžná automatická záloha bez jakéhokoliv skriptování
   z naší strany. Retenční okno ale záleží na tarifu — potvrzeno je
   30 dní na placeném "Scaler" plánu a až 90 dní na vyšších tiers;
   pro free tier (na kterém teď appka běží) nebylo v dokumentaci
   nalezeno explicitní potvrzení, že PITR vůbec je součástí/jaké má
   okno. **Nespoléhat se zatím na PITR jako jedinou zálohu** — `.dump`
   zůstává primární plán, PITR je bonus, kdyby náhodou fungoval i na
   free tieru.
4. **Trigger/automatizace**: pravidelně (např. GitHub Actions cron,
   stejně jako u Sheets sync plánu výše) spustit `.dump` příkaz a
   poslat výsledek mailem. Frekvence: ideálně po každé změně dat
   (jednou appka bude psát do DB rovnou přes formulář — viz plán výše),
   do té doby stačí po každém ručním `import:data`. Objem u
   rodinného/osobního provozu je malý, takže mail při každé změně
   nebude spam.
5. **Odeslání e-mailu**: z NestJS backendu nebo přímo z GitHub Actions
   jobu, např. Resend (štědrý free tier, jednoduché API) nebo
   Nodemailer přes Gmail SMTP app password. Cílová adresa zatím
   uživatelův Gmail.

Vztah k Sheets sync plánu výše: Sheet po zavedení sync bude taky fungovat
jako jistá záloha, ale `.dump` je jednodušší, nezávislý na Sheets API a
je to přesná bitová kopie celé DB (ne jen přepis dat do jiné struktury).

Stav: **zatím jen nápad/diskuze (2026-07-25)**, ještě neimplementováno.
