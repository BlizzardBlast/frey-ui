import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Breadcrumbs from './index';

describe('Breadcrumbs', () => {
  it('renders accessible breadcrumb navigation semantics', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.List>
          <Breadcrumbs.Item>
            <Breadcrumbs.Link href='/'>Home</Breadcrumbs.Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>
            <Breadcrumbs.Current>Settings</Breadcrumbs.Current>
          </Breadcrumbs.Item>
        </Breadcrumbs.List>
      </Breadcrumbs>
    );

    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('applies aria-current to the current breadcrumb', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.List>
          <Breadcrumbs.Item>
            <Breadcrumbs.Current>Current</Breadcrumbs.Current>
          </Breadcrumbs.Item>
        </Breadcrumbs.List>
      </Breadcrumbs>
    );

    expect(screen.getByText('Current')).toHaveAttribute('aria-current', 'page');
  });

  it('supports custom separators via CSS variable', () => {
    render(
      <Breadcrumbs separator='>' data-testid='breadcrumbs'>
        <Breadcrumbs.List>
          <Breadcrumbs.Item>
            <Breadcrumbs.Current>Current</Breadcrumbs.Current>
          </Breadcrumbs.Item>
        </Breadcrumbs.List>
      </Breadcrumbs>
    );

    expect(
      screen
        .getByTestId('breadcrumbs')
        .style.getPropertyValue('--frey-breadcrumb-separator')
    ).toBe('">"');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Breadcrumbs>
        <Breadcrumbs.List>
          <Breadcrumbs.Item>
            <Breadcrumbs.Link href='/projects'>Projects</Breadcrumbs.Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>
            <Breadcrumbs.Current>Roadmap</Breadcrumbs.Current>
          </Breadcrumbs.Item>
        </Breadcrumbs.List>
      </Breadcrumbs>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
