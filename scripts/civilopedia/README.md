# Civilopedia descriptions

Script per generare le descrizioni di leader e civiltà dal sito
[civilopedia.net](https://www.civilopedia.net/it/gathering-storm/civilizations/)
(versione italiana, regole Gathering Storm) e per confrontarle con quelle
scritte a mano.

## Cosa produce

```
public/AUTOCivDescrizioni/
├── DescrizionePersonaggi/<Nome leader>.txt
├── DescrizioneCiviltà/<Nome civiltà>.txt
├── comparison-report.md
├── comparison-report.json
└── scrape-report.json
```

Il formato è lo stesso usato dall'app e dal seeding:

```
[Abilità] {Abilità esclusiva}

Testo con [IconToken] al posto delle icone.

[Unità] {Unità speciali}

Testo...
```

I file vengono usati dal pulsante **Development Tools → Database Seeding**
della pagina `/dev` (il servizio `seedDescriptions` legge da
`public/AUTOCivDescrizioni`).

## Comandi

```bash
npm run descriptions:scrape      # scarica tutto (leader + civiltà)
npm run descriptions:compare     # confronta AUTO con quelle manuali
npm run descriptions:colors      # genera i colori dei leader
npm run descriptions:civicons    # scarica i loghi civiltà alternativi
npm run descriptions:upload      # dry run dell'upload su Firestore
node scripts/civilopedia/upload.mjs --apply   # scrive su Firestore
```

Opzioni utili:

```bash
node scripts/civilopedia/scrape.mjs --only=leaders
node scripts/civilopedia/scrape.mjs --only=civs
node scripts/civilopedia/scrape.mjs --limit=3        # test veloce
node scripts/civilopedia/scrape.mjs --no-cache       # ignora la cache HTML
node scripts/civilopedia/scrape.mjs --map-only       # mostra la mappatura leader → slug
node scripts/civilopedia/compare.mjs --threshold=0.95
node scripts/civilopedia/upload.mjs --verify-only    # confronta Firestore con i file AUTO
```

## Come funziona

1. Scarica l'indice di leader e civiltà dalla pagina di civilopedia.
2. Mappa i nomi italiani dell'app sugli slug del sito
   (`CIV_SLUGS` e `LEADER_SLUG_OVERRIDES` in `scrape.mjs`). La mappatura dei
   leader è automatica, con override per Qin Shi Huang e per i due Saladino
   (il sito inverte le abilità delle due persona).
3. Per ogni leader prende l'abilità esclusiva e le eventuali unità/strutture
   esclusive collegate nella sidebar (es. Basilio II → Tagma).
4. Per ogni civiltà prende l'abilità della civiltà e le voci di
   "Unità speciali"/"Infrastruttura speciale" collegate nella sidebar.
5. Converte le icone `<img>` in token `[IconNome]` riconosciuti dall'app
   (`ICON_MAP`); le icone non presenti nella UI vengono scartate e registrate
   in `scrape-report.json`.
6. Scrive i file in `public/AUTOCivDescrizioni` con cache HTML in
   `scripts/civilopedia/.cache` (ignorata da git).

## Icone delle abilità

Durante lo scraping ogni abilità riceve l'icona della sua pagina civilopedia:

- abilità del leader → icona del leader
- abilità della civiltà → icona della civiltà
- unità / edifici / distretti / miglioramenti esclusivi → icona della voce

Le immagini vengono salvate in `public/IconeAbilità/` e il manifest
`public/AUTOCivDescrizioni/ability-icons.json` le associa a ogni abilità.
L'upload aggiunge il campo `icon` a ogni voce di `abilities` e
`civilizationAbilities`, e la tooltip dell'app mostra l'icona in un cerchio
accanto al nome.

## Colori dei leader

`colors.mjs` genera `src/data/leaderColors.json` partendo da:

- `PlayerColors.xml` / `PlayerStandardColors.xml` del gioco (colori esatti e
  tre jersey alternative per i leader presenti nei dati);
- per i leader con colori non presenti nel dump (per lo più espansioni),
  l'immagine della jersey principale dalla Civilization Wiki, campionata con
  Pillow.

La palette viene usata come accento in tooltip, card del draft, righe partita
e tier list (`getLeaderPalette` / `getCivPalette` in
`src/utils/leaderColors.js`). La generazione dei colori campionati richiede
`python` con Pillow nel PATH (oppure la variabile `PYTHON`).

## Loghi civiltà alternativi

`civicons.mjs` scarica dalla tabella Jersey System della Civilization Wiki il
logo della civiltà nella variante colore del leader (es. Abraham Lincoln usa
l'America bianca, non quella blu standard). Le immagini finiscono in
`public/IconeCiviltàAlterne/`, il manifest in
`public/AUTOCivDescrizioni/civ-icons.json`; l'upload aggiorna
`civilizationIconPath` di ogni leader e conserva l'originale in
`baseCivilizationIconPath`.

## Confronto

`compare.mjs` normalizza testo e icone, abbina le abilità per nome e calcola
una similarità (Levenshtein) per ogni descrizione. Il report indica punteggio,
copertura e media per file. Con i dati attuali:

- leader: **100%** (29/29 file esistenti)
- civiltà: **99,0%** (32/33; l'unica differenza è `Mali`, dove il file manuale
  contiene per errore "Ipaspista" al posto dell'unità esclusiva del Mali)
- media complessiva: **99,46%**

Il file `Didone.txt` nella cartella manuale `DescrizioneCiviltà` è un refuso
(è un leader) ed è escluso dal confronto.

## Upload

`upload.mjs` crea un account Firebase temporaneo via Auth REST (le regole
Firestore attuali permettono a qualsiasi utente autenticato di scrivere nella
collezione `leaders`), aggiorna i campi `abilities` e
`civilizationAbilities` di ogni documento leader, verifica i contenuti e
cancella l'account al termine.

> Nota: con regole Firestore più restrittive questo script andrà sostituito da
> un seed con service account / Cloud Function.

## Manutenzione

- Se civilopedia cambia layout, aggiornare i selettori in
  `extractSections`/`getSidebarItems`.
- Se un nuovo leader non viene mappato, aggiungerlo a
  `LEADER_SLUG_OVERRIDES`.
- Se un'icona non viene riconosciuta, aggiungerla a `ICON_MAP`.
- Dopo un aggiornamento del gioco, rilanciare scrape + compare e, se la soglia
  è rispettata, `--apply`.
