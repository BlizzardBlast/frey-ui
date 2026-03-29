import { render, screen } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThemeProvider from '../ThemeProvider';
import Portal from './Portal';

describe('Portal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('renders children into document.body and cleans up on unmount', () => {
    const { unmount } = render(
      <Portal>
        <span>Portal content</span>
      </Portal>
    );

    const portalNode = document.querySelector('[data-frey-portal="true"]');

    expect(portalNode).toBeInTheDocument();
    expect(portalNode).toContainElement(screen.getByText('Portal content'));

    unmount();

    expect(
      document.querySelector('[data-frey-portal="true"]')
    ).not.toBeInTheDocument();
  });

  it('supports rendering into a custom container', () => {
    const customContainer = document.createElement('section');
    customContainer.dataset.testid = 'custom-container';
    document.body.appendChild(customContainer);

    render(
      <Portal container={customContainer}>
        <span>Custom portal content</span>
      </Portal>
    );

    const portalNode = customContainer.querySelector(
      '[data-frey-portal="true"]'
    );

    expect(portalNode).toBeInTheDocument();
    expect(portalNode).toContainElement(
      screen.getByText('Custom portal content')
    );
  });

  it('applies theme attributes when rendered inside ThemeProvider', () => {
    render(
      <ThemeProvider theme='dark' highContrast>
        <Portal>
          <span>Themed content</span>
        </Portal>
      </ThemeProvider>
    );

    const portalNode = screen
      .getByText('Themed content')
      .closest('[data-frey-portal="true"]');

    expect(portalNode).toHaveClass('frey-theme-provider');
    expect(portalNode).toHaveAttribute('data-frey-theme', 'dark');
    expect(portalNode).toHaveAttribute('data-frey-high-contrast', 'true');
  });

  it('returns null safely when portal node is unavailable', () => {
    const useStateSpy = vi.spyOn(React, 'useState');

    useStateSpy.mockImplementationOnce((() => [null, vi.fn()]) as never);

    render(
      <Portal>
        <span>Unavailable portal content</span>
      </Portal>
    );

    expect(
      screen.queryByText('Unavailable portal content')
    ).not.toBeInTheDocument();
    expect(document.querySelector('[data-frey-portal="true"]')).toBeNull();
  });

  it('returns empty markup when server-rendered without document', () => {
    vi.stubGlobal('document', undefined);

    const markup = renderToString(
      <Portal>
        <span>Server content</span>
      </Portal>
    );

    expect(markup).toBe('');
  });
});
