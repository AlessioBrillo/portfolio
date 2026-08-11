import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Who } from '@/sections/Who';
import { ToneProvider } from '@/components/ascent/ToneProvider';
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

  it('uses the night muted tone for statements when the scene is on night', () => {
    render(
      <ToneProvider initialTone="night">
        <Who surface="scene" />
      </ToneProvider>,
    );
    const statement = getWhoStatements()[0];
    if (!statement) return;
    expect(screen.getByText(statement.line)).toHaveClass('text-muted-dark');
  });
});
