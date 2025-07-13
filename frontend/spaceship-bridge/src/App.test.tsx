import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading state initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Loading USS Agentopia Bridge/i);
  expect(loadingElement).toBeInTheDocument();
});

test('shows navigation with ship view, roster, and game mechanics buttons', () => {
  render(<App />);
  const shipViewButton = screen.getByText(/Ship View/i);
  const rosterButton = screen.getByText(/Roster/i);
  const mechanicsButton = screen.getByText(/Game Mechanics/i);
  
  expect(shipViewButton).toBeInTheDocument();
  expect(rosterButton).toBeInTheDocument();
  expect(mechanicsButton).toBeInTheDocument();
});

test('shows ship view selected by default', () => {
  render(<App />);
  const shipViewButton = screen.getByRole('button', { name: /ship view/i });
  expect(shipViewButton).toHaveStyle('font-weight: 600');
});