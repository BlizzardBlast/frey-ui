// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// 👇 If you're using Next.js, import from @storybook/nextjs
//   If you're using Next.js with Vite, import from @storybook/experimental-nextjs-vite
import { setProjectAnnotations } from '@storybook/react-vite';
import * as previewAnnotations from './.storybook/preview';

setProjectAnnotations([previewAnnotations]);
