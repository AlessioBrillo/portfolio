import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from '@/App';

vi.mock('@/router', () => {
  const { createMemoryRouter } = require('react-router-dom');
  return {
    router: createMemoryRouter([{ path: '/', element: <div data-testid="mock-page">Home</div> }]),
  };
});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('mock-page')).toBeInTheDocument();
  });
});
