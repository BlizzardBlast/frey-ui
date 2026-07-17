---
type: "query"
date: "2026-07-17T07:54:08.328488+00:00"
question: "How does dismissibleLayer scrollbar press detection work, and which tests and overlay consumers depend on it?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["dismissibleLayer.ts", "isScrollbarPress()", "eventIsInside()", "useDismissibleLayer()", "dismissibleLayer.test.tsx", "overlays.spec.ts", "Popover", "DropdownMenuRoot()", "Tooltip()"]
---

# Q: How does dismissibleLayer scrollbar press detection work, and which tests and overlay consumers depend on it?

## Answer

Expanded from original query via graph vocabulary: dismissible, dismiss, scrollbar, press, layer, manager, event, overlay, popover, dropdown, tooltip, test. Traversal found isScrollbarPress and eventIsInside inside dismissibleLayer, direct useDismissibleLayer consumers in Popover, DropdownMenu, and Tooltip, focused coverage in dismissibleLayer.test.tsx, and downstream overlay coverage in overlays.spec.ts; DatePicker reaches dismissal through Popover.

## Outcome

- Signal: useful

## Source Nodes

- dismissibleLayer.ts
- isScrollbarPress()
- eventIsInside()
- useDismissibleLayer()
- dismissibleLayer.test.tsx
- overlays.spec.ts
- Popover
- DropdownMenuRoot()
- Tooltip()