import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading state initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Loading USS Agentopia Bridge/i);
  expect(loadingElement).toBeInTheDocument();
});

test('shows navigation with ship, manifest, and screen buttons', () => {
  render(<App />);
  const shipButton = screen.getByText(/Ship/i);
  const manifestButton = screen.getByText(/Manifest/i);
  const screenButton = screen.getByText(/Screen/i);
  
  expect(shipButton).toBeInTheDocument();
  expect(manifestButton).toBeInTheDocument();
  expect(screenButton).toBeInTheDocument();
});

test('shows screen selected by default', () => {
  render(<App />);
  const screenButton = screen.getByRole('button', { name: /screen/i });
  expect(screenButton).toHaveStyle('font-weight: 600');
});
