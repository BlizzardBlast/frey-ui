// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { beforeAll } from 'vitest';
// 👇 If you're using Next.js, import from @storybook/nextjs
//   If you're using Next.js with Vite, import from @storybook/experimental-nextjs-vite
import { setProjectAnnotations } from '@storybook/react';
import * as previewAnnotations from './.storybook/preview';

const annotations = setProjectAnnotations([previewAnnotations]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);
