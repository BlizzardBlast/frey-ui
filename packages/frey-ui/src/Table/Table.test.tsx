import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Table from './index';
import styles from './table.module.css';

describe('Table', () => {
  it('renders semantic table sections and cells', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Role</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Ada</Table.Cell>
            <Table.Cell>Admin</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Name' })
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ada' })).toBeInTheDocument();
  });

  it('defaults Table.Head scope to col', () => {
    render(
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Project</Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>
    );

    expect(
      screen.getByRole('columnheader', { name: 'Project' })
    ).toHaveAttribute('scope', 'col');
  });

  it('wraps the table with overflow container styles', () => {
    render(
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Cell</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const table = screen.getByRole('table');

    expect(table.parentElement).toHaveClass(styles.table_container);
  });

  it('renders footer section semantics', () => {
    render(
      <Table>
        <Table.Footer>
          <Table.Row>
            <Table.Cell>Summary</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );

    const cell = screen.getByRole('cell', { name: 'Summary' });

    expect(cell.closest('tfoot')).toBeInTheDocument();
  });

  it('forwards refs to the table element', () => {
    const ref = React.createRef<HTMLTableElement>();

    render(
      <Table ref={ref}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Cell</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Table>
        <Table.Caption>Team members</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Sam</Table.Cell>
            <Table.Cell>Active</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
