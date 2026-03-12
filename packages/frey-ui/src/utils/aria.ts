import type React from 'react';

export function computeAriaProps(
  hasError: boolean,
  describedBy?: string,
  ariaDescribedBy?: string,
  ariaInvalid?: React.AriaAttributes['aria-invalid']
): Pick<React.AriaAttributes, 'aria-invalid' | 'aria-describedby'> {
  const mergedDescribedBy =
    [describedBy, ariaDescribedBy].filter(Boolean).join(' ') || undefined;
  const isInvalid = hasError || ariaInvalid === true || ariaInvalid === 'true';

  return {
    'aria-invalid': isInvalid || undefined,
    'aria-describedby': mergedDescribedBy
  };
}
