import { render, screen } from '@testing-library/react';
import HermesPage from './page';

describe('Hermes command world', () => {
  it('renders the approved command surface', () => {
    render(<HermesPage />);
    expect(screen.getByText(/WISE² HERMES/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AUTO' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'LOCAL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CLOUD' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask Hermes anything/i)).toBeInTheDocument();
    expect(screen.getByText(/LIVE CONTEXT/i)).toBeInTheDocument();
  });
});