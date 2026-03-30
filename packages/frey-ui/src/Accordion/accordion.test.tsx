import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import Accordion from './index';

describe('Accordion', () => {
  it('throws when a compound child is rendered outside Accordion root', () => {
    expect(() => {
      render(<Accordion.Item value='one'>Invalid</Accordion.Item>);
    }).toThrow('Accordion components must be wrapped in <Accordion>');
  });

  it('throws when Trigger is rendered outside Accordion.Item', () => {
    expect(() => {
      render(
        <Accordion>
          <Accordion.Trigger>Invalid trigger</Accordion.Trigger>
        </Accordion>
      );
    }).toThrow('Accordion.Item parts must be wrapped in <Accordion.Item>');
  });

  it('toggles section visibility in single mode', async () => {
    const user = userEvent.setup();

    render(
      <Accordion>
        <Accordion.Item value='one'>
          <Accordion.Trigger>First section</Accordion.Trigger>
          <Accordion.Content>First content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'First section' });
    const panel = screen.getByText('First content').closest('section');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('aria-hidden', 'true');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toHaveAttribute('aria-hidden', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps collapsed content out of keyboard tab order', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Accordion>
          <Accordion.Item value='one'>
            <Accordion.Trigger>Focusable section</Accordion.Trigger>
            <Accordion.Content>
              <button type='button'>Inside hidden panel</button>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        <button type='button'>After accordion</button>
      </>
    );

    const trigger = screen.getByRole('button', { name: 'Focusable section' });
    const after = screen.getByRole('button', { name: 'After accordion' });

    trigger.focus();
    await user.tab();

    expect(after).toHaveFocus();
  });

  it('restores stored tabindex values when a panel opens', async () => {
    const user = userEvent.setup();

    render(
      <Accordion>
        <Accordion.Item value='one'>
          <Accordion.Trigger>Restore tabindex</Accordion.Trigger>
          <Accordion.Content>
            <button type='button'>Natural button</button>
            <button type='button' tabIndex={0}>
              Custom tabindex button
            </button>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Restore tabindex' });
    const naturalButton = screen.getByText('Natural button');
    const customButton = screen.getByText('Custom tabindex button');

    expect(naturalButton).toHaveAttribute('tabindex', '-1');
    expect(customButton).toHaveAttribute('tabindex', '-1');
    expect(naturalButton).toHaveAttribute('data-frey-accordion-tabindex', '');
    expect(customButton).toHaveAttribute('data-frey-accordion-tabindex', '0');

    await user.click(trigger);

    expect(naturalButton).not.toHaveAttribute('tabindex');
    expect(customButton).toHaveAttribute('tabindex', '0');
    expect(naturalButton).not.toHaveAttribute('data-frey-accordion-tabindex');
    expect(customButton).not.toHaveAttribute('data-frey-accordion-tabindex');
  });

  it('does not mutate focusable elements when opened content has no stored metadata', () => {
    render(
      <Accordion defaultValue='one'>
        <Accordion.Item value='one'>
          <Accordion.Trigger>Open without metadata</Accordion.Trigger>
          <Accordion.Content>
            <button type='button' tabIndex={0}>
              Preserved tabindex button
            </button>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const button = screen.getByRole('button', {
      name: 'Preserved tabindex button'
    });

    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).not.toHaveAttribute('data-frey-accordion-tabindex');
  });

  it('skips tabindex updates for elements that already have Accordion metadata while closed', () => {
    render(
      <Accordion>
        <Accordion.Item value='one'>
          <Accordion.Trigger>Pre-tagged closed content</Accordion.Trigger>
          <Accordion.Content>
            <button type='button' tabIndex={0} data-frey-accordion-tabindex='5'>
              Pre-tagged button
            </button>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const button = screen.getByText('Pre-tagged button');

    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).toHaveAttribute('data-frey-accordion-tabindex', '5');
  });

  it('toggles open state with keyboard Enter', async () => {
    const user = userEvent.setup();

    render(
      <Accordion>
        <Accordion.Item value='one'>
          <Accordion.Trigger>Keyboard section</Accordion.Trigger>
          <Accordion.Content>Keyboard content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Keyboard section' });

    trigger.focus();
    await user.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports multiple mode with independent open items', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type='multiple' defaultValue={['one']}>
        <Accordion.Item value='one'>
          <Accordion.Trigger>First item</Accordion.Trigger>
          <Accordion.Content>First body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value='two'>
          <Accordion.Trigger>Second item</Accordion.Trigger>
          <Accordion.Content>Second body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const firstTrigger = screen.getByRole('button', { name: 'First item' });
    const secondTrigger = screen.getByRole('button', { name: 'Second item' });
    const firstPanel = screen.getByText('First body').closest('section');
    const secondPanel = screen.getByText('Second body').closest('section');

    expect(firstPanel).toHaveAttribute('aria-hidden', 'false');
    expect(secondPanel).toHaveAttribute('aria-hidden', 'true');

    await user.click(secondTrigger);

    expect(firstPanel).toHaveAttribute('aria-hidden', 'false');
    expect(secondPanel).toHaveAttribute('aria-hidden', 'false');

    await user.click(firstTrigger);

    expect(firstPanel).toHaveAttribute('aria-hidden', 'true');
    expect(secondPanel).toHaveAttribute('aria-hidden', 'false');
  });

  it('supports multiple mode without defaultValue', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type='multiple'>
        <Accordion.Item value='one'>
          <Accordion.Trigger>No default multiple</Accordion.Trigger>
          <Accordion.Content>No default body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'No default multiple' });
    const panel = screen.getByText('No default body').closest('section');

    expect(panel).toHaveAttribute('aria-hidden', 'true');

    await user.click(trigger);

    expect(panel).toHaveAttribute('aria-hidden', 'false');
  });

  it('handles non-string controlled value in single mode defensively', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Accordion type='single' value={[]} onValueChange={onValueChange}>
        <Accordion.Item value='one'>
          <Accordion.Trigger>Single defensive</Accordion.Trigger>
          <Accordion.Content>Single defensive body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    await user.click(screen.getByRole('button', { name: 'Single defensive' }));

    expect(onValueChange).toHaveBeenCalledWith('one');
  });

  it('handles non-array controlled value in multiple mode defensively', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Accordion
        type='multiple'
        value='not-an-array'
        onValueChange={onValueChange}
      >
        <Accordion.Item value='one'>
          <Accordion.Trigger>Multiple defensive</Accordion.Trigger>
          <Accordion.Content>Multiple defensive body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: 'Multiple defensive' });
    const panel = screen
      .getByText('Multiple defensive body')
      .closest('section');

    await user.click(trigger);

    expect(onValueChange).toHaveBeenCalledWith(['one']);
    expect(panel).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports controlled value via onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Accordion value='one' onValueChange={onValueChange}>
        <Accordion.Item value='one'>
          <Accordion.Trigger>First controlled</Accordion.Trigger>
          <Accordion.Content>First controlled body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value='two'>
          <Accordion.Trigger>Second controlled</Accordion.Trigger>
          <Accordion.Content>Second controlled body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    await user.click(screen.getByRole('button', { name: 'First controlled' }));
    await user.click(screen.getByRole('button', { name: 'Second controlled' }));

    expect(onValueChange).toHaveBeenNthCalledWith(1, '');
    expect(onValueChange).toHaveBeenNthCalledWith(2, 'two');
    expect(
      screen.getByText('First controlled body').closest('section')
    ).toHaveAttribute('aria-hidden', 'false');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Accordion defaultValue='one'>
        <Accordion.Item value='one'>
          <Accordion.Trigger>A11y section</Accordion.Trigger>
          <Accordion.Content>Accessible content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
