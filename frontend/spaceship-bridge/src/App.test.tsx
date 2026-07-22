import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import App from './App';

describe('App', () => {
  test('shows the LCARS navigation with all five views', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /BRIDGE/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CREW/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ACCESS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SYSTEMS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /THEATER/i })).toBeInTheDocument();
  });

  test('defaults to the SYSTEMS view', () => {
    render(<App />);
    const systemsButton = screen.getByRole('button', { name: /SYSTEMS/i });
    expect(systemsButton).toHaveClass('active');
  });
});
