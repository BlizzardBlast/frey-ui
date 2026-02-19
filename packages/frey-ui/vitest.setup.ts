import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
import { toHaveNoViolations } from 'jest-axe';
import { expect } from 'vitest';

expect.extend(jestDomMatchers);
expect.extend(toHaveNoViolations);
