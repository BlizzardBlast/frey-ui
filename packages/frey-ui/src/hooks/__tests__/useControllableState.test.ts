import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from '../useControllableState';

describe('useControllableState', () => {
  it('uses defaultValue for uncontrolled state', () => {
    const { result } = renderHook(() => useControllableState(undefined, false));

    expect(result.current[0]).toBe(false);
  });

  it('updates internal state when uncontrolled', () => {
    const { result } = renderHook(() => useControllableState(undefined, false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('uses controlled value when provided', () => {
    const { result } = renderHook(() => useControllableState(true, false));

    expect(result.current[0]).toBe(true);
  });

  it('does not update internal state when controlled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState(false, false, onChange)
    );

    act(() => {
      result.current[1](true);
    });

    // value remains false because it's controlled
    expect(result.current[0]).toBe(false);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange callback in both modes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState(undefined, false, onChange)
    );

    act(() => {
      result.current[1](true);
    });

    expect(onChange).toHaveBeenCalledWith(true);
    expect(result.current[0]).toBe(true);
  });
});
