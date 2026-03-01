# Sistema Leaders - Documentazione

## Panoramica

Il sistema Leaders gestisce i profili di tutti i leader di Civilization VI nel database Firestore. Ogni leader ha un documento con informazioni complete, link alle icone, e campi predisposti per descrizioni e statistiche.

## Struttura Dati

### Documento Leader

Ogni leader nel database ha la seguente struttura:

```javascript
{
  // Identificatori
  id: "abraham-lincoln",              // Slug univoco (usato come document ID)
  number: 1,                          // Posizione alfabetica (1-77)

  // Informazioni base
  name: "Abraham Lincoln",            // Nome del leader
  civilization: "America",            // Civiltà del leader
  variant: null,                      // Variante (es: "La Magnifica", "Regina Nera")

  // Icone (path relativi)
  leaderIconPath: "/IconePersonaggi/Abraham Lincoln [America].webp",
  civilizationIconPath: "/IconeCiviltà/[America].webp",

  // Descrizione e informazioni
  description: "",                    // Descrizione del leader (vuota inizialmente)

  // Gameplay info
  abilities: [],                      // Array di abilità uniche
  agenda: "",                         // Agenda del leader
  uniqueUnits: [],                   // Unità uniche
  uniqueBuildings: [],               // Edifici unici
  uniqueDistricts: [],               // Distretti unici

  // Statistiche (struttura flessibile)
  stats: {},                         // Oggetto per statistiche personalizzate

  // Metadata
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:00:00.000Z"
}
```

## Leader con Varianti

Alcuni leader hanno più varianti (alternate personas):

### Esempi:

- **Caterina de' Medici**: "La Magnifica" e "Regina Nera"
- **Cleopatra**: "Egiziana" e "Tolemaica"
- **Eleonora d'Aquitania**: "Francia" e "Inghilterra"
- **Kublai Khan**: "Cina" e "Mongolia"
- **Teddy Roosevelt**: "L'alce" e "Rough Rider"
- **Vittoria**: "Età del Vapore" e "Età dell'Impero"

**Struttura per varianti:**

```javascript
{
  id: "caterina-de-medici-la-magnifica",
  number: 7,
  name: "Caterina de' Medici",
  civilization: "Francia",
  variant: "La Magnifica",
  ...
}
```

## Database Seeding

### Console Browser

```javascript
// Verifica i dati dei leader
window.verifyLeaders();

// Esegui il seeding completo
window.seedDatabase();
```

### Metodo 3: Programmazione Diretta

```javascript
import { seedLeaders } from "./services/firebase/seedLeaders";

async function populate() {
  const result = await seedLeaders();
  if (result.success) {
    console.log(`✨ Aggiunti ${result.count} leader!`);
  }
}
```

## API Functions

### Lettura Leaders

```javascript
import {
  getAllLeaders,
  getLeaderById,
  getLeadersByCivilization,
  searchLeaders,
} from "./services/firebase";

// Ottieni tutti i leader (ordinati per numero)
const leaders = await getAllLeaders();
// => Array di 77 leader

// Ottieni un leader specifico
const lincoln = await getLeaderById("abraham-lincoln");
// => { id: "abraham-lincoln", name: "Abraham Lincoln", ... }

// Ottieni tutti i leader di una civiltà
const greekLeaders = await getLeadersByCivilization("Grecia");
// => [{ name: "Gorgo", ... }, { name: "Pericle", ... }]

// Cerca leader per nome o civiltà
const results = await searchLeaders("gandhi");
// => [{ name: "Gandhi", civilization: "India", ... }]
```

### Aggiornamento Leaders

```javascript
import {
  updateLeaderDescription,
  updateLeaderAbilities,
  updateLeaderAgenda,
} from "./services/firebase";

// Aggiorna descrizione
await updateLeaderDescription(
  "abraham-lincoln",
  "Il 16° presidente degli Stati Uniti...",
);

// Aggiorna abilità
await updateLeaderAbilities("abraham-lincoln", [
  "Governo del Popolo: +1 Influenza ogni 3 turni",
  "Bonus distretto Fabbrica dopo Preserva",
]);

// Aggiorna agenda
await updateLeaderAgenda(
  "abraham-lincoln",
  "Emancipatore - Ama le civiltà democratiche",
);
```

## Regole Firestore

```javascript
// Leaders Collection è READ-ONLY per utenti
match /leaders/{leaderId} {
  // Tutti gli utenti autenticati possono leggere
  allow get, list: if isSignedIn();

  // Solo admin possono scrivere (usa Console o Admin SDK)
  allow create, update, delete: if false;
}
```

## Hooks Personalizzati

### useLeaders (da creare)

```javascript
import { useCollection } from "./hooks";

export function useLeaders() {
  const {
    documents: leaders,
    loading,
    error,
  } = useCollection("leaders", [
    { type: "orderBy", field: "number", direction: "asc" },
  ]);

  return { leaders, loading, error };
}
```

### useLeader (da creare)

```javascript
import { useDocument } from "./hooks";

export function useLeader(leaderId) {
  const { document: leader, loading, error } = useDocument("leaders", leaderId);

  return { leader, loading, error };
}
```

## Lista Completa Leaders

Tutti i 77 leader sono nel file: `public/ListaPersonaggiCiviltà.txt`

### Per Civiltà:

- **America**: Abraham Lincoln, Teddy Roosevelt (2 varianti)
- **Arabia**: Saladino (2 varianti)
- **Australia**: John Curtin
- **Aztechi**: Montezuma
- **Babilonia**: Hammurabi
- **Bisanzio**: Basilio II, Teodora
- **Brasile**: Pedro II
- **Canada**: Wilfrid Laurier
- **Cina**: Kublai Khan, Qin Shi Huang (2 varianti), Wu Zetian, Yongle
- **Congo**: Mvemba a Nzinga, Nzinga Mbande
- **Corea**: Sejong, Seondeok
- **Cree**: Poundmaker
- **Egitto**: Cleopatra (2 varianti), Ramses II
- **Etiopia**: Menelik II
- **Fenicia**: Didone
- **Francia**: Caterina de' Medici (2 varianti), Eleonora d'Aquitania
- **Gallia**: Ambiorix
- **Georgia**: Tamara
- **Germania**: Federico Barbarossa, Ludovico II
- **Giappone**: Hojo Tokimune, Tokugawa
- **Gran Colombia**: Simón Bolívar
- **Grecia**: Gorgo, Pericle
- **Impero Ottomano**: Solimano (2 varianti)
- **Inca**: Pachacuti
- **India**: Chandragupta, Gandhi
- **Indonesia**: Gitarja
- **Inghilterra**: Eleonora d'Aquitania, Elisabetta I, Vittoria (2 varianti)
- **Khmer**: Jayavarman VII
- **Macedonia**: Alessandro
- **Mali**: Mansa Musa, Sundiata Keita
- **Maori**: Kupe
- **Mapuche**: Lautaro
- **Maya**: Wac-Chanil-Ahau
- **Mongolia**: Genghis Khan, Kublai Khan
- **Norvegia**: Harald Hardrada (2 varianti)
- **Nubia**: Amanitore
- **Olanda**: Guglielmina
- **Persia**: Ciro, Nadir Shah
- **Polonia**: Edvige
- **Portogallo**: João III
- **Roma**: Giulio Cesare, Traiano
- **Russia**: Pietro
- **Scizia**: Tomiri
- **Scozia**: Robert Bruce
- **Spagna**: Filippo II
- **Sumeria**: Gilgamesh
- **Svezia**: Cristina
- **Ungheria**: Mattia Corvino
- **Vietnam**: Ba Trieu
- **Zulù**: Shaka

**Totale**: 77 leader (50 civiltà)

## File Modificati/Creati

### Nuovi File:

- `src/services/firebase/leaders.js` - Servizio CRUD leaders
- `src/services/firebase/seedLeaders.js` - Script di popolazione database
- `src/utils/seedDatabase.js` - Utility di seeding con window API
- `docs/LEADERS_SYSTEM.md` - Questa documentazione

### File Modificati:

- `src/services/firebase/index.js` - Export funzioni leaders
- `src/main.jsx` - Import seedDatabase utility
- `firestore.rules` - Regole per collezione leaders

## Prossimi Sviluppi

Il sistema è pronto per:

- 📝 **Editor Descrizioni**: Interfaccia per aggiungere descrizioni ai leader
- 🎯 **Sistema Abilities**: UI per definire abilità uniche
- 📊 **Stats Tracker**: Tracking statistiche di gioco per campagne
- 🏆 **Leaderboards**: Classifiche per leader più usati/vincenti
- 🔍 **Advanced Search**: Ricerca avanzata con filtri multipli
- 🎨 **Leader Cards**: Componenti visivi per mostrare i leader
- 📱 **Mobile Gallery**: Galleria swipe di leader per mobile

## Note Tecniche

### Performance

- **Indici Firestore**: Creati automaticamente su `number` e `civilization`
- **Caching**: Usa `useCollection` hook per real-time updates con cache locale
- **Lazy Loading**: Carica icone solo quando necessario

### Manutenibilità

- **Struttura Modulare**: Servizi separati per ogni collezione
- **Type Safety Ready**: Struttura compatibile con TypeScript
- **Documentazione Completa**: Ogni funzione ha JSDoc comments

### Scalabilità

- **77 documenti**: Dimensione gestibilissima per Firestore
- **Real-time Ready**: Supporto nativo per aggiornamenti live
- **Query Efficienti**: Ordinamento e filtri server-side
