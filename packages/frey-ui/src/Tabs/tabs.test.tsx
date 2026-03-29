import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Tabs from './index';

describe('Tabs', () => {
  it('throws when a compound child is rendered outside Tabs root', () => {
    expect(() => {
      render(<Tabs.Trigger value='one'>One</Tabs.Trigger>);
    }).toThrow(
      'Tabs compound components must be rendered within a Tabs component'
    );
  });

  it('supports controlled mode via value and onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Tabs value='one' onValueChange={onValueChange}>
        <Tabs.List>
          <Tabs.Trigger value='one'>One</Tabs.Trigger>
          <Tabs.Trigger value='two'>Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='one'>Panel One</Tabs.Content>
        <Tabs.Content value='two'>Panel Two</Tabs.Content>
      </Tabs>
    );

    await user.click(screen.getByRole('tab', { name: 'Two' }));

    expect(onValueChange).toHaveBeenCalledWith('two');
    expect(screen.getByText('Panel One')).toBeInTheDocument();
    expect(screen.queryByText('Panel Two')).not.toBeInTheDocument();
  });

  it('starts with no selected panel when defaultValue is omitted', () => {
    render(
      <Tabs>
        <Tabs.List>
          <Tabs.Trigger value='one'>One</Tabs.Trigger>
          <Tabs.Trigger value='two'>Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='one'>Panel One</Tabs.Content>
        <Tabs.Content value='two'>Panel Two</Tabs.Content>
      </Tabs>
    );

    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
  });

  it('supports arrow navigation when each trigger is wrapped in extra markup', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue='one'>
        <Tabs.List>
          <div>
            <Tabs.Trigger value='one'>One</Tabs.Trigger>
          </div>
          <div>
            <Tabs.Trigger value='two'>Two</Tabs.Trigger>
          </div>
        </Tabs.List>
        <Tabs.Content value='one'>Panel One</Tabs.Content>
        <Tabs.Content value='two'>Panel Two</Tabs.Content>
      </Tabs>
    );

    const one = screen.getByRole('tab', { name: 'One' });
    const two = screen.getByRole('tab', { name: 'Two' });

    await user.click(one);
    await user.keyboard('{ArrowRight}');

    expect(two).toHaveFocus();
    expect(two).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel Two')).toBeInTheDocument();
  });

  it('supports ArrowLeft keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue='one'>
        <Tabs.List>
          <Tabs.Trigger value='one'>One</Tabs.Trigger>
          <Tabs.Trigger value='two'>Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='one'>Panel One</Tabs.Content>
        <Tabs.Content value='two'>Panel Two</Tabs.Content>
      </Tabs>
    );

    const one = screen.getByRole('tab', { name: 'One' });
    const two = screen.getByRole('tab', { name: 'Two' });

    await user.click(two);
    await user.keyboard('{ArrowLeft}');

    expect(one).toHaveFocus();
    expect(one).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel One')).toBeInTheDocument();
  });

  it('supports Home and End keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue='one'>
        <Tabs.List>
          <Tabs.Trigger value='one'>One</Tabs.Trigger>
          <Tabs.Trigger value='two'>Two</Tabs.Trigger>
          <Tabs.Trigger value='three'>Three</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='one'>Panel One</Tabs.Content>
        <Tabs.Content value='two'>Panel Two</Tabs.Content>
        <Tabs.Content value='three'>Panel Three</Tabs.Content>
      </Tabs>
    );

    const one = screen.getByRole('tab', { name: 'One' });
    const three = screen.getByRole('tab', { name: 'Three' });

    await user.click(one);
    await user.keyboard('{End}');

    expect(three).toHaveFocus();
    expect(three).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel Three')).toBeInTheDocument();

    await user.keyboard('{Home}');

    expect(one).toHaveFocus();
    expect(one).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel One')).toBeInTheDocument();
  });

  it('skips disabled tabs during keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue='one'>
        <Tabs.List>
          <Tabs.Trigger value='one'>One</Tabs.Trigger>
          <Tabs.Trigger value='two' disabled>
            Two
          </Tabs.Trigger>
          <Tabs.Trigger value='three'>Three</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='one'>Panel One</Tabs.Content>
        <Tabs.Content value='two'>Panel Two</Tabs.Content>
        <Tabs.Content value='three'>Panel Three</Tabs.Content>
      </Tabs>
    );

    const one = screen.getByRole('tab', { name: 'One' });
    const three = screen.getByRole('tab', { name: 'Three' });

    await user.click(one);
    await user.keyboard('{ArrowRight}');

    expect(three).toHaveFocus();
    expect(three).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel Three')).toBeInTheDocument();
  });

  it('does not change selection for Home and End when all tabs are disabled', () => {
    render(
      <Tabs defaultValue='one'>
        <Tabs.List>
          <Tabs.Trigger value='one' disabled>
            One
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='one'>Panel One</Tabs.Content>
      </Tabs>
    );

    const one = screen.getByRole('tab', { name: 'One' });

    fireEvent.keyDown(one, { key: 'Home' });
    fireEvent.keyDown(one, { key: 'End' });

    expect(one).toHaveAttribute('aria-selected', 'true');
  });
});
