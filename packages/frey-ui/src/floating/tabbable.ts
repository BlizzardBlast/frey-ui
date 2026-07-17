const focusableSelector = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'object',
  'embed',
  '[contenteditable]:not([contenteditable="false"])',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[tabindex]',
].join(',');

function isElementDisabled(element: HTMLElement): boolean {
  return element.matches(':disabled') || element.closest('[inert]') !== null;
}

function isInsideClosedDetails(element: HTMLElement): boolean {
  let current = element.parentElement;
  while (current) {
    if (current.tagName === 'DETAILS' && !current.hasAttribute('open')) {
      const summary = [...current.children].find(
        (child) => child.tagName === 'SUMMARY'
      );
      if (!summary?.contains(element)) return true;
    }
    current = current.parentElement;
  }
  return false;
}

function isElementVisible(element: HTMLElement): boolean {
  if (isInsideClosedDetails(element)) return false;
  let current: HTMLElement | null = element;
  while (current) {
    if (current.hidden) return false;
    const style = current.ownerDocument.defaultView?.getComputedStyle(current);
    if (style?.display === 'none' || style?.visibility === 'hidden') {
      return false;
    }
    current = current.parentElement;
  }
  return true;
}

function isRadio(element: HTMLElement): element is HTMLInputElement {
  return (
    element.tagName === 'INPUT' &&
    (element as HTMLInputElement).type === 'radio'
  );
}

function filterRadioGroups(candidates: HTMLElement[]): HTMLElement[] {
  const radioGroups: HTMLInputElement[][] = [];

  candidates.forEach((element) => {
    if (!isRadio(element) || !element.name) return;
    const group = radioGroups.find(
      ([radio]) => radio.name === element.name && radio.form === element.form
    );
    if (group) {
      group.push(element);
    } else {
      radioGroups.push([element]);
    }
  });

  const allowedRadios = new Set<HTMLInputElement>();
  radioGroups.forEach((group) => {
    allowedRadios.add(group.find((radio) => radio.checked) ?? group[0]);
  });

  return candidates.filter(
    (element) =>
      !isRadio(element) || !element.name || allowedRadios.has(element)
  );
}

function sortByTabOrder(elements: HTMLElement[]): HTMLElement[] {
  return elements
    .map((element, documentOrder) => ({ documentOrder, element }))
    .sort((first, second) => {
      const firstTabIndex = first.element.tabIndex;
      const secondTabIndex = second.element.tabIndex;
      if (firstTabIndex === secondTabIndex) {
        return first.documentOrder - second.documentOrder;
      }
      if (firstTabIndex === 0) return 1;
      if (secondTabIndex === 0) return -1;
      return firstTabIndex - secondTabIndex;
    })
    .map(({ element }) => element);
}

export function getTabbableElements(content: HTMLElement): HTMLElement[] {
  const candidates = [
    ...content.querySelectorAll<HTMLElement>(focusableSelector),
  ]
    .filter((element) => element.tabIndex >= 0)
    .filter((element) => !isElementDisabled(element))
    .filter(isElementVisible);

  return sortByTabOrder(filterRadioGroups(candidates));
}
