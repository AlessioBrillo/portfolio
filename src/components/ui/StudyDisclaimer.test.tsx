import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyDisclaimer } from '@/components/ui/StudyDisclaimer';

describe('StudyDisclaimer', () => {
  it('is an accessible note with the operational-use warning', () => {
    render(<StudyDisclaimer />);
    const note = screen.getByRole('note', { name: 'Scope of this study' });
    expect(note).toBeInTheDocument();
    expect(note).toHaveTextContent('Educational use only');
    expect(note).toHaveTextContent('must not be used to plan or execute a flight');
  });
});
