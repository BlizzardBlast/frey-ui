# Frey UI

A strict, accessible design system library for internal applications.

## Installation

```bash
pnpm add frey-ui
# OR
npm install frey-ui
```

## Setup

Import the CSS once in your root file (for example `App.tsx` or `layout.tsx`):

```tsx
import 'frey-ui/style.css';
```

## Usage

```tsx
import { Chip, Switch } from 'frey-ui';

function App() {
  return (
    <>
      <Chip label='Status' variant='outlined' />
      <Switch label='Enable Dark Mode' />
    </>
  );
}
```
