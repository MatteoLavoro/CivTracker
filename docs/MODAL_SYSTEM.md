# Sistema di Gestione Modali - CivTracker

Sistema centralizzato per la gestione di modali con supporto per modali annidati (nested modals) e integrazione con browser history.

## 🏗️ Architettura

### 1. **ModalContext** (`src/contexts/ModalContext.jsx`)

Cuore del sistema che gestisce:

- **modalStack**: Stack di modali "normali" aperti con `openModal()`
- **nestedCloseCallbacksRef**: Stack di callback per modali annidati
- **Gestione History Browser**: Ogni modale aggiunge una entry alla history
- **Tasto Escape**: Chiude il modale più in alto
- **Body Scroll Lock**: Previene lo scroll quando i modali sono aperti

### 2. **Modal Component** (`src/components/common/Modal.jsx`)

Componente modale riutilizzabile che:

- Si registra automaticamente come modale "nested" con `registerNestedClose()`
- Gestisce il proprio body scroll lock con position fixed
- Calcola z-index dinamicamente basato su `modalDepth`
- Supporta modali di conferma (dangerous actions)

## 📖 Come Funziona

### Modali Nested (Approccio Attuale)

I modali esistenti (ProfileModal, CampaignInfoModal, TextInputModal) sono **nested modals**:

1. Quando un modale si apre, chiama `registerNestedClose(callback)`
2. Il callback viene aggiunto allo stack di modali annidati
3. Quando l'utente preme back/escape, il ModalContext chiama il callback
4. Il modale si chiude e viene rimosso dallo stack

```jsx
// Automaticamente gestito da Modal.jsx
useEffect(() => {
  if (!isOpen) return;

  const unregister = registerNestedClose(() => {
    onCloseRef.current();
  });

  window.history.pushState({ nestedModal: true }, "");

  return () => unregister();
}, [isOpen, registerNestedClose]);
```

### Modali Normali (Opzionale)

Per modali gestiti direttamente dal context:

```jsx
const { openModal, closeModal } = useModal();

// Apri modale
openModal('myModal', { title: 'Test', data: {...} });

// Chiudi modale
closeModal();
```

## 🎯 Funzionalità Principali

### Gestione Back Button

- ✅ Browser back button chiude il modale più in alto
- ✅ Android back button funziona correttamente
- ✅ Modali annidati si chiudono uno alla volta
- ✅ History sincronizzata automaticamente

### Tasto Escape

- ✅ Escape chiude sempre il modale più in alto
- ✅ Gestione centralizzata tramite ModalContext

### Z-Index Dinamico

- ✅ Calcolo automatico basato su modalDepth
- ✅ Base z-index: 1000
- ✅ Ogni livello aggiunge +10
- ✅ Modali di conferma hanno +10 rispetto al parent

### Body Scroll Lock

- ✅ Scroll bloccato quando modali aperti
- ✅ Ripristino automatico alla chiusura
- ✅ Gestione position e scroll offset

## 🔧 API ModalContext

### Hook: `useModal()`

```jsx
const {
  modalStack, // Array di modali aperti
  modalDepth, // Numero di modali aperti
  openModal, // Apri modale normale
  closeModal, // Chiudi ultimo modale
  closeAllModals, // Chiudi tutti i modali
  closeTopModal, // Chiudi il più in alto (nested o normale)
  registerNestedClose, // Registra callback per nested modal
  hasNestedModals, // Check se ci sono nested modals
  wasPopstateHandled, // Check se popstate è stato gestito
  isModalOpen, // Check se un modale è aperto
  getModalIndex, // Ottieni indice di un modale
} = useModal();
```

## 📝 Modali Esistenti

Tutti i modali esistenti sono già integrati e funzionanti:

- ✅ **ProfileModal** - Gestione profilo utente
- ✅ **CampaignInfoModal** - Info campagna con edit name
- ✅ **TextInputModal** - Input generico con validazione
- ✅ **ConfirmModal** (dentro Modal.jsx) - Conferme azioni pericolose

## 🎨 Best Practices

### 1. Chiusura Modali

Usa sempre `window.history.back()` per chiudere un modale:

```jsx
// ✅ Corretto
const handleClose = () => {
  window.history.back();
};

// ❌ Evitare (bypassa la history)
const handleClose = () => {
  setIsOpen(false);
};
```

### 2. Modali Annidati

I modali annidati (uno sopra l'altro) funzionano automaticamente:

```jsx
// Modal A apre Modal B
<Modal isOpen={modalAOpen}>
  <button onClick={() => setModalBOpen(true)}>Apri B</button>
</Modal>

<Modal isOpen={modalBOpen}>
  Contenuto Modal B
</Modal>
```

### 3. Azioni Pericolose

Usa `footer.dangerous` per azioni che richiedono conferma:

```jsx
<Modal
  footer={{
    dangerous: true,
    label: "Elimina",
    onConfirm: handleDelete,
    dangerousMessage: "Sei sicuro di voler eliminare?",
  }}
>
  Contenuto modale
</Modal>
```

## 🚀 Vantaggi

1. **Gestione Centralizzata**: Un solo punto di controllo per tutti i modali
2. **History Integration**: Back button funziona come previsto
3. **Nested Modals**: Supporto automatico per modali sovrapposti
4. **Z-Index Dinamico**: Non più conflitti di z-index
5. **Escape Support**: Tasto Escape gestito centralmente
6. **Clean Code**: Meno boilerplate nei componenti

## 🔄 Migrazione (Già Completata)

Tutti i modali sono già migrati al nuovo sistema. Non serve fare nulla! Il sistema è retrocompatibile con i modali esistenti.

## 🐛 Debug

Per debuggare lo stato dei modali:

```jsx
const { modalStack, modalDepth, hasNestedModals } = useModal();

console.log("Modali aperti:", modalStack.length);
console.log("Profondità:", modalDepth);
console.log("Ha nested:", hasNestedModals());
```
