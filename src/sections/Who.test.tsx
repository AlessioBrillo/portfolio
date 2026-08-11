import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Who } from '@/sections/Who';
import { getWhoPortrait, getWhoStatements } from '@/content/who';

describe('Who', () => {
  it('renders the band with its section header', () => {
    render(<Who />);
    expect(screen.getByRole('region', { name: /who i am/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Enterprising, adventurous, curious',
    );
  });

  it('renders one statement per entry in the content module', () => {
    render(<Who />);
    const statements = getWhoStatements();
    for (const statement of statements) {
      expect(screen.getByRole('heading', { name: statement.title })).toBeInTheDocument();
      expect(screen.getByText(statement.line)).toBeInTheDocument();
    }
  });

  it('renders the portrait slot with its alt text', () => {
    render(<Who />);
    expect(screen.getByText(getWhoPortrait().alt)).toBeInTheDocument();
  });
});
