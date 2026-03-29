import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Slot } from './slot';

describe('Slot', () => {
  it('returns null when child is not a valid React element', () => {
    const { container } = render(
      <Slot>{'invalid child' as unknown as React.ReactElement}</Slot>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('merges style and className props from slot and child', () => {
    render(
      <Slot className='slot-class' style={{ color: 'red' }}>
        <button
          type='button'
          className='child-class'
          style={{ backgroundColor: 'blue' }}
        >
          Merge target
        </button>
      </Slot>
    );

    const button = screen.getByRole('button', { name: 'Merge target' });
    const inlineStyle = button.getAttribute('style') ?? '';

    expect(button).toHaveClass('slot-class');
    expect(button).toHaveClass('child-class');
    expect(inlineStyle).toContain('color: red');
    expect(inlineStyle).toContain('background-color: blue');
  });

  it('composes event handlers and respects defaultPrevented', () => {
    const slotClick = vi.fn();
    const childClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });

    render(
      <Slot onClick={slotClick}>
        <button type='button' onClick={childClick}>
          Event target
        </button>
      </Slot>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Event target' }));

    expect(childClick).toHaveBeenCalledTimes(1);
    expect(slotClick).not.toHaveBeenCalled();
  });
});
