'use client';

import { Component, type ReactNode } from 'react';
import { Button } from './ui';

type Props = { children: ReactNode };
type State = { message: string | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message || 'The command workspace failed to render.' };
  }

  render() {
    if (!this.state.message) return this.props.children;
    return (
      <div role="alert" className="glass mx-auto mt-10 max-w-lg rounded-3xl p-6">
        <p className="text-sm uppercase tracking-[0.16em] text-critical">Workspace error</p>
        <p className="mt-2 text-snow">{this.state.message}</p>
        <p className="mt-2 text-sm text-chrome">Queue context is preserved. Retry to reload the simulated desk.</p>
        <div className="mt-4">
          <Button onClick={() => this.setState({ message: null })}>Retry workspace</Button>
        </div>
      </div>
    );
  }
}
