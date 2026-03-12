export function createMockRect({
  x = 0,
  y = 0,
  width = 0,
  height = 0
}: Readonly<{
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}>): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({})
  } as DOMRect;
}
