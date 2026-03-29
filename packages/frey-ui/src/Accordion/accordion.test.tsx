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
    expect(panel).toHaveAttribute('hidden');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('hidden');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden');
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

    expect(firstPanel).not.toHaveAttribute('hidden');
    expect(secondPanel).toHaveAttribute('hidden');

    await user.click(secondTrigger);

    expect(firstPanel).not.toHaveAttribute('hidden');
    expect(secondPanel).not.toHaveAttribute('hidden');

    await user.click(firstTrigger);

    expect(firstPanel).toHaveAttribute('hidden');
    expect(secondPanel).not.toHaveAttribute('hidden');
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

    expect(panel).toHaveAttribute('hidden');

    await user.click(trigger);

    expect(panel).not.toHaveAttribute('hidden');
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
    expect(panel).toHaveAttribute('hidden');
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
    ).not.toHaveAttribute('hidden');
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
