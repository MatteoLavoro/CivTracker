# Modal Component Documentation

## Overview

Il componente `Modal` è un modale generico e riutilizabile che gestisce la chiusura tramite History API, supporta layout responsive e può essere usato come base per tutti i modali nell'applicazione.

## Features

- ✅ **Gestione History API**: Chiusura con back button (browser/Android)
- ✅ **Responsive**: Desktop (rounded) e Mobile (fullscreen)
- ✅ **Modali innestati**: Supporto per modali sovrapposti con gestione corretta della history
- ✅ **Accessibilità**: ARIA labels, keyboard accessible
- ✅ **FAB Mobile adattivo**: Si adatta all'apertura della tastiera
- ✅ **Chiusura via History**: X/freccia e back button, tutti tramite history
- ✅ **Footer opzionale**: Con bottone conferma/disabilitato
- ✅ **Portal rendering**: Renderizzato fuori dalla gerarchia DOM

## Struttura

Il modale è diviso in 3 parti:

1. **Header**: Titolo centrato + bottone chiusura (X desktop, freccia mobile)
2. **Body**: Contenuto variabile (children)
3. **Footer**: Opzionale, bottone conferma (largo desktop, FAB mobile)

Ogni parte è separata da una linea divisoria decorativa.

## Usage

### Basic Modal (solo informazioni)

```jsx
import { useState } from "react";
import { Modal } from "../components/common";

function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Apri Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Informazioni"
      >
        <p>Questo è un modale di base senza footer.</p>
      </Modal>
    </>
  );
}
```

### Modal with Confirmation

```jsx
import { useState } from "react";
import { Modal } from "../components/common";
import { Check } from "lucide-react";

function Example() {
  const [isOpen, setIsOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleConfirm = () => {
    console.log("Confermato!");
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Apri Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Conferma Azione"
        footer={{
          onConfirm: handleConfirm,
          disabled: !isValid,
          label: "Conferma", // Desktop
          icon: <Check size={24} />, // Mobile FAB
        }}
      >
        <p>Vuoi confermare questa azione?</p>
        <label>
          <input
            type="checkbox"
            checked={isValid}
            onChange={(e) => setIsValid(e.target.checked)}
          />
          Accetto i termini
        </label>
      </Modal>
    </>
  );
}
```

### Nested Modals

```jsx
function Example() {
  const [modal1Open, setModal1Open] = useState(false);
  const [modal2Open, setModal2Open] = useState(false);

  return (
    <>
      <button onClick={() => setModal1Open(true)}>Apri Modal 1</button>

      <Modal
        isOpen={modal1Open}
        onClose={() => setModal1Open(false)}
        title="Primo Modal"
      >
        <p>Questo è il primo modale.</p>
        <button onClick={() => setModal2Open(true)}>Apri Modal 2</button>
      </Modal>

      <Modal
        isOpen={modal2Open}
        onClose={() => setModal2Open(false)}
        title="Secondo Modal"
      >
        <p>Questo è il secondo modale (innestato).</p>
      </Modal>
    </>
  );
}
```

## Props

| Prop        | Type      | Default  | Description                         |
| ----------- | --------- | -------- | ----------------------------------- |
| `isOpen`    | boolean   | required | Stato apertura modale               |
| `onClose`   | function  | required | Callback quando il modale si chiude |
| `title`     | string    | required | Titolo del modale                   |
| `children`  | ReactNode | required | Contenuto del body                  |
| `footer`    | object    | `null`   | Configurazione footer (vedi sotto)  |
| `className` | string    | `""`     | Classe CSS aggiuntiva               |

### Footer Object

| Property           | Type      | Default      | Description                                      |
| ------------------ | --------- | ------------ | ------------------------------------------------ |
| `onConfirm`        | function  | required     | Callback bottone conferma                        |
| `disabled`         | boolean   | `false`      | Stato disabilitato                               |
| `dangerous`        | boolean   | `false`      | Marca l'azione come pericolosa (mostra conferma) |
| `dangerousMessage` | string    | -            | Messaggio custom per la conferma pericolosa      |
| `label`            | string    | `"Conferma"` | Testo bottone (desktop)                          |
| `icon`             | ReactNode | `<Check />`  | Icona FAB (mobile)                               |

## Behavior

### Desktop

- Modale centrato con bordi arrotondati
- Bottone X per chiudere (cerchio in alto a destra)
- Footer: bottone largo quanto il modale (se presente)
- Max width: 480px (elegante e compatto)

### Mobile

- Modale fullscreen
- Freccia indietro per chiudere (cerchio in alto a sinistra)
- Footer: FAB flottante circolare (bottom-right)
- FAB si adatta automaticamente all'apertura della tastiera

### Chiusura

Il modale può essere chiuso in questi modi:

1. Click su X (desktop) o freccia (mobile)
2. Back button del browser
3. Back button Android

Tutti i metodi di chiusura usano la History API. Ogni apertura aggiunge un entry alla history.

**Modali Innestati**: Grazie alla gestione corretta della history, i modali innestati si chiudono in ordine inverso (LIFO) quando si usa il back button.

### Azioni Pericolose

Quando `footer.dangerous=true`:

- Il click sul bottone conferma **non esegue direttamente** l'azione
- Viene aperto un **modale di conferma innestato** con design rosso/warning
- Il modale di conferma mostra:
  - Icona di warning pulsante
  - Messaggio personalizzabile (`footer.dangerousMessage`)
  - Warning "Questa azione potrebbe essere irreversibile"
  - Bottone conferma rosso
- Solo dopo la conferma nel modale secondario viene eseguito `footer.onConfirm`
- Consente di prevenire azioni accidentali (es: eliminazioni, reset, ecc.)

**Uso consigliato**: Attiva `dangerous: true` per azioni distruttive come:

- Eliminazione di dati
- Reset di configurazioni
- Logout forzato di altri utenti
- Cambio di impostazioni critiche

### Stato Disabled

Quando `footer.disabled=true`:

- Desktop: bottone con colore spento e cursor not-allowed
- Mobile: FAB con colore spento e non cliccabile
- Visivamente indica che i prerequisiti non sono soddisfatti

## Styling

I colori seguono il design system dell'app:

- Background: `rgba(20, 30, 40, 0.98)` con backdrop blur
- Bordi: `rgba(212, 175, 55, 0.3)` (dorato)
- Primary: `rgba(15, 50, 82, 1)` (blu scuro)
- Divider: Gradiente dorato semitrasparente

Le animazioni sono fluide con cubic-bezier per un'esperienza moderna.

## Accessibility

- ARIA labels sui bottoni
- Keyboard accessible (pulsante X/freccia con Tab)
- Focus visible con outline
- Screen reader friendly
- Body scroll prevention quando il modale è aperto

## Examples in Project

```jsx
// Modal di conferma eliminazione con azione pericolosa
<Modal
  isOpen={deleteModalOpen}
  onClose={() => setDeleteModalOpen(false)}
  title="Elimina Elemento"
  footer={{
    onConfirm: handleDelete,
    dangerous: true, // Mostra conferma aggiuntiva
    dangerousMessage: "Sei sicuro di voler eliminare questo elemento? I dati saranno persi per sempre.",
    label: "Elimina",
    icon: <Trash2 size={24} />,
  }}
>
  <p>Stai per eliminare un elemento importante.</p>
  <p style={{ color: "rgba(255, 215, 0, 0.8)" }}>⚠️ Questa azione è irreversibile.</p>
</Modal>

// Modal form con validazione
<Modal
  isOpen={formModalOpen}
  onClose={() => setFormModalOpen(false)}
  title="Nuovo Elemento"
  footer={{
    onConfirm: handleSubmit,
    disabled: !isFormValid,
    label: "Crea",
    icon: <Plus size={24} />,
  }}
>
  <form>
    <Input label="Nome" value={name} onChange={setName} />
    <Input label="Descrizione" value={desc} onChange={setDesc} />
  </form>
</Modal>
```

## ⚡ Optimistic Updates Pattern

**IMPORTANTE**: Tutti i modali che effettuano mutazioni di dati devono usare il pattern degli **aggiornamenti ottimistici** per evitare lag nell'interfaccia.

### Perché gli aggiornamenti ottimistici?

Quando l'utente modifica dei dati (es. cambia username), non deve aspettare che Firebase completi l'operazione prima di vedere il cambiamento. L'UI deve rispondere immediatamente mentre l'aggiornamento avviene in background.

### Come implementare

```jsx
function MyModal({ isOpen, onClose, user, onUpdateData }) {
  // Stato ottimistico: null = usa dati reali, valore = mostra override temporaneo
  const [optimisticOverride, setOptimisticOverride] = useState(null);

  // Mostra l'override se presente, altrimenti i dati reali
  const displayValue = optimisticOverride ?? user?.realValue ?? "Default";

  const handleSubmit = async (newValue) => {
    // 1. Aggiorna UI immediatamente (ottimistico)
    setOptimisticOverride(newValue);

    // 2. Aggiorna Firebase in background
    if (onUpdateData) {
      try {
        await onUpdateData(newValue);
        // 3. Successo: rimuovi override, usa dati Firebase aggiornati
        setOptimisticOverride(null);
      } catch (error) {
        // 4. Errore: ripristina valore originale
        setOptimisticOverride(null);
        console.error("Update failed:", error);
        // Opzionale: mostra messaggio di errore all'utente
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifica">
      <p>Valore attuale: {displayValue}</p>
      <button onClick={() => handleSubmit("nuovo valore")}>Aggiorna</button>
    </Modal>
  );
}
```

### Esempio reale: ProfileModal

Vedi `ProfileModal.jsx` per un'implementazione completa del pattern ottimistico per l'aggiornamento del nome utente.

**Flusso**:

1. Utente clicca "Salva" → UI mostra nuovo nome immediatamente
2. Firebase lavora in background
3. Se successo → cancella override, Firebase ha i nuovi dati
4. Se errore → cancella override, ripristina nome originale

**Vantaggi**:

- ✅ Nessun lag percepito dall'utente
- ✅ UI sempre reattiva
- ✅ Rollback automatico in caso di errore
- ✅ Migliore UX complessiva

**Best Practices**:

- Usa `null` per indicare "nessun override" invece di duplicare il valore reale
- Sempre gestire il caso di errore con revert
- Mostra un messaggio di errore all'utente se l'operazione fallisce
- Non bloccare l'UI durante operazioni asincrone

## Future Enhancements

Possibili miglioramenti futuri:

- Varianti di dimensione (small, medium, large, fullscreen)
- Animazioni personalizzabili
- Multiple footer buttons
- Custom header actions
- Drag to close (mobile)
- Loading state per footer button
