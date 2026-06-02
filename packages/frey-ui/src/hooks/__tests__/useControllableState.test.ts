import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableValue } from '../useControllableState';

describe('useControllableValue<boolean>', () => {
  it('uses defaultValue for uncontrolled state', () => {
    const { result } = renderHook(() =>
      useControllableValue<boolean>(undefined, false)
    );

    expect(result.current[0]).toBe(false);
  });

  it('updates internal state when uncontrolled', () => {
    const { result } = renderHook(() =>
      useControllableValue<boolean>(undefined, false)
    );

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });

  it('uses controlled value when provided', () => {
    const { result } = renderHook(() =>
      useControllableValue<boolean>(true, false)
    );

    expect(result.current[0]).toBe(true);
  });

  it('does not update internal state when controlled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableValue<boolean>(false, false, onChange)
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
      useControllableValue<boolean>(undefined, false, onChange)
    );

    act(() => {
      result.current[1](true);
    });

    expect(onChange).toHaveBeenCalledWith(true);
    expect(result.current[0]).toBe(true);
  });
});

describe('useControllableValue', () => {
  it('uses defaultValue for uncontrolled string state', () => {
    const { result } = renderHook(() =>
      useControllableValue<string>(undefined, 'basic')
    );

    expect(result.current[0]).toBe('basic');
  });

  it('updates internal state when uncontrolled', () => {
    const { result } = renderHook(() =>
      useControllableValue<string>(undefined, 'basic')
    );

    act(() => {
      result.current[1]('advanced');
    });

    expect(result.current[0]).toBe('advanced');
  });

  it('does not update internal state when controlled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableValue<string>('one', 'fallback', onChange)
    );

    act(() => {
      result.current[1]('two');
    });

    expect(result.current[0]).toBe('one');
    expect(onChange).toHaveBeenCalledWith('two');
  });

  it('supports array values', () => {
    const { result } = renderHook(() =>
      useControllableValue<string[] | undefined>(undefined, ['alpha'])
    );

    act(() => {
      result.current[1](['alpha', 'beta']);
    });

    expect(result.current[0]).toEqual(['alpha', 'beta']);
  });
});
