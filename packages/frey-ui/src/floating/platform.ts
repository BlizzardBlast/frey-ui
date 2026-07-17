export function isWebKit(ownerWindow: Window | null): boolean {
  const css = (
    ownerWindow as
      | (Window & {
          CSS?: { supports(property: string, value: string): boolean };
        })
      | null
  )?.CSS;
  return Boolean(css?.supports?.('-webkit-backdrop-filter', 'none') ?? false);
}

export function isSafari(ownerWindow: Window | null): boolean {
  return (
    isWebKit(ownerWindow) &&
    ownerWindow?.navigator.vendor.includes('Apple') === true
  );
}
