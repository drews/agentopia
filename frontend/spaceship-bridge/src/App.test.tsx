import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading state initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Loading USS Agentopia Bridge/i);
  expect(loadingElement).toBeInTheDocument();
});

test('shows disconnected status initially', () => {
  render(<App />);
  const statusElement = screen.getByText(/Status: Disconnected/i);
  expect(statusElement).toBeInTheDocument();
});
