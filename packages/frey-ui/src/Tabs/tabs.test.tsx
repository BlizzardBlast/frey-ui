import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Tabs from './index';

describe('Tabs', () => {
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
});
