import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Card from './index';

describe('Card', () => {
  it('renders compound card sections', () => {
    render(
      <Card data-testid='card'>
        <Card.Header>
          <Card.Title>Card title</Card.Title>
        </Card.Header>
        <Card.Content>Body content</Card.Content>
        <Card.Footer>
          <button type='button'>Action</button>
        </Card.Footer>
      </Card>
    );

    expect(screen.getByTestId('card')).toContainElement(
      screen.getByRole('heading', { level: 3, name: 'Card title' })
    );
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('forwards refs to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Card ref={ref}>Ref card</Card>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveTextContent('Ref card');
  });

  it('merges custom className values', () => {
    render(
      <Card data-testid='styled-card' className='custom-card-class'>
        <Card.Content>Styled card</Card.Content>
      </Card>
    );

    expect(screen.getByTestId('styled-card')).toHaveClass('custom-card-class');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <Card.Header>
          <Card.Title>A11y card title</Card.Title>
        </Card.Header>
        <Card.Content>A11y content</Card.Content>
      </Card>
    );

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
