import { act, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Avatar from './index';

describe('Avatar', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders fallback content when src is not provided', () => {
    render(<Avatar alt='Fallback user' fallback='FU' />);

    expect(screen.getByText('FU')).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: 'Fallback user' })
    ).not.toBeInTheDocument();
  });

  it('renders image when source loads successfully', async () => {
    class SuccessfulImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => {
          this.onload?.();
        });
      }
    }

    vi.stubGlobal('Image', SuccessfulImage as unknown as typeof Image);

    render(
      <Avatar
        src='https://example.com/avatar.jpg'
        alt='Loaded user'
        fallback='LU'
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('img', { name: 'Loaded user' })
      ).toBeInTheDocument();
    });

    expect(screen.queryByText('LU')).not.toBeInTheDocument();
  });

  it('renders fallback when image loading fails', async () => {
    class FailingImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => {
          this.onerror?.();
        });
      }
    }

    vi.stubGlobal('Image', FailingImage as unknown as typeof Image);

    render(
      <Avatar
        src='https://example.com/broken.jpg'
        alt='Broken user'
        fallback='BU'
      />
    );

    await waitFor(() => {
      expect(screen.getByText('BU')).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('img', { name: 'Broken user' })
    ).not.toBeInTheDocument();
  });

  it('ignores image status updates after unmount', () => {
    class DeferredImage {
      static readonly instances: DeferredImage[] = [];

      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        DeferredImage.instances.push(this);
      }

      set src(_value: string) {
        // Intentionally no-op: test manually triggers callbacks after unmount.
      }
    }

    vi.stubGlobal('Image', DeferredImage as unknown as typeof Image);

    const { unmount } = render(
      <Avatar
        src='https://example.com/deferred.jpg'
        alt='Deferred user'
        fallback='DU'
      />
    );

    const imageInstance = DeferredImage.instances[0];

    expect(imageInstance).toBeDefined();

    unmount();

    expect(() => {
      act(() => {
        imageInstance.onload?.();
        imageInstance.onerror?.();
      });
    }).not.toThrow();
  });

  it('forwards refs to the root avatar element', () => {
    const ref = React.createRef<HTMLSpanElement>();

    render(<Avatar ref={ref} fallback='RF' />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('renders status indicator when status is provided', () => {
    render(<Avatar fallback='SU' status='online' />);

    expect(screen.getByTitle('online')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Avatar alt='A11y user' fallback='AU' />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
