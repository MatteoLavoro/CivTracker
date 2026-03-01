# Firebase Deployment - Firestore Rules & Indexes

## Deploy Firestore Rules

Per deployare le regole di sicurezza di Firestore, esegui:

```bash
firebase deploy --only firestore:rules
```

## Deploy Firestore Indexes

Per deployare gli indici di Firestore, esegui:

```bash
firebase deploy --only firestore:indexes
```

## Deploy Tutto

Per deployare sia rules che indexes:

```bash
firebase deploy --only firestore
```

## Regole di Sicurezza Implementate

Le regole di sicurezza garantiscono che:

1. **Lettura Campagne**: Un utente può leggere solo le campagne di cui è membro
2. **Creazione Campagne**: Un utente autenticato può creare una campagna e deve includersi come membro
3. **Aggiornamento Campagne**: I membri possono:
   - Modificare il nome della campagna
   - Aggiungere nuovi membri
   - Rimuovere se stessi dalla campagna
4. **Eliminazione Campagne**: Una campagna può essere eliminata solo quando l'ultimo membro esce

## Indici Firestore

Gli indici ottimizzano le query per:

- Recupero campagne per utente (ordinato per data aggiornamento)
- Ricerca campagne per codice

## Note

- Le regole sono state progettate per garantire che tutti i membri abbiano pari diritti
- La campagna viene automaticamente eliminata quando l'ultimo membro esce
- I codici campagna sono univoci a 8 caratteri (lettere maiuscole e numeri)
