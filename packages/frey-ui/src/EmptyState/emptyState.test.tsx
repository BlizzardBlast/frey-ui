import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it } from 'vitest';
import EmptyState from './index';

describe('EmptyState', () => {
  it('renders compound content without live-region semantics by default', () => {
    render(
      <EmptyState data-testid='empty-state'>
        <EmptyState.Icon aria-hidden='true'>
          <span data-testid='illustration'>Illustration</span>
        </EmptyState.Icon>
        <EmptyState.Title>No projects yet</EmptyState.Title>
        <EmptyState.Description>
          Create a project to start organizing your work.
        </EmptyState.Description>
        <EmptyState.Actions>
          <button type='button'>Create project</button>
        </EmptyState.Actions>
      </EmptyState>
    );

    expect(screen.getByTestId('illustration')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'No projects yet' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Create a project to start organizing your work.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create project' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).not.toHaveAttribute('role');
  });

  it('allows the title element to be chosen independently from its styling', () => {
    const titleRef = React.createRef<HTMLHeadingElement>();

    render(
      <EmptyState>
        <EmptyState.Title as='h2' ref={titleRef}>
          Search results
        </EmptyState.Title>
      </EmptyState>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Search results' })
    ).toBe(titleRef.current);
  });

  it('supports a title-only empty state and forwards the root ref', () => {
    const rootRef = React.createRef<HTMLDivElement>();

    render(
      <EmptyState ref={rootRef}>
        <EmptyState.Title>Nothing to show</EmptyState.Title>
      </EmptyState>
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(rootRef.current).toHaveTextContent('Nothing to show');
  });

  it('forwards custom classes, styles, and compact layout metadata', () => {
    render(
      <EmptyState
        className='custom-empty-state'
        data-testid='empty-state'
        layout='compact'
        style={{ minHeight: 240 }}
      >
        <EmptyState.Description
          className='custom-description'
          data-testid='description'
          style={{ maxWidth: 320 }}
        >
          No matching records.
        </EmptyState.Description>
      </EmptyState>
    );

    expect(screen.getByTestId('empty-state')).toHaveClass(
      'custom-empty-state'
    );
    expect(screen.getByTestId('empty-state')).toHaveAttribute(
      'data-layout',
      'compact'
    );
    expect(screen.getByTestId('empty-state')).toHaveStyle({ minHeight: 240 });
    expect(screen.getByTestId('description')).toHaveClass(
      'custom-description'
    );
    expect(screen.getByTestId('description')).toHaveStyle({ maxWidth: 320 });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EmptyState>
        <EmptyState.Icon aria-hidden='true'>Empty</EmptyState.Icon>
        <EmptyState.Title as='h2'>No saved reports</EmptyState.Title>
        <EmptyState.Description>
          Save a report to make it available here.
        </EmptyState.Description>
        <EmptyState.Actions>
          <button type='button'>Create report</button>
          <button type='button'>Learn more</button>
        </EmptyState.Actions>
      </EmptyState>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
