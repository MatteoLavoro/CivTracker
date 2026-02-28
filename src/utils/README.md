# Utilities

Helper functions and utility modules.

## Structure

```
utils/
├── date.js          # Date formatting helpers
├── validation.js    # Input validation
├── format.js        # Data formatting
└── constants.js     # App constants
```

## Example

```javascript
// utils/date.js
export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function isToday(date) {
  const today = new Date();
  const compareDate = new Date(date);
  return today.toDateString() === compareDate.toDateString();
}
```

## Usage

```javascript
import { formatDate, isToday } from "../utils/date";

const date = new Date();
console.log(formatDate(date)); // "2/28/2026"
console.log(isToday(date)); // true
```
