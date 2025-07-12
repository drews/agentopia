import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders agent showcase initially', () => {
  render(<App />);
  const showcaseElement = screen.getByText(/Agent Representation Showcase/i);
  expect(showcaseElement).toBeInTheDocument();
});

test('shows switch to bridge view button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Switch to Bridge View/i);
  expect(buttonElement).toBeInTheDocument();
});

test('shows LCARS theme selected by default', () => {
  render(<App />);
  const lcarsButton = screen.getByRole('button', { name: /lcars/i });
  expect(lcarsButton).toHaveStyle('font-weight: bold');
});
