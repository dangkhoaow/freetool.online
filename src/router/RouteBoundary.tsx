import React, { Component, type ReactNode } from 'react';
import NotFoundPage from '../../app/not-found';
import ErrorPage from '../../app/error';
import { isNotFoundRouteError } from './not-found-error';

type RouteBoundaryProps = {
  children: ReactNode;
};

type RouteBoundaryState = {
  error: unknown | null;
  resetKey: number;
};

export class RouteBoundary extends Component<RouteBoundaryProps, RouteBoundaryState> {
  state: RouteBoundaryState = {
    error: null,
    resetKey: 0,
  };

  static getDerivedStateFromError(error: unknown): RouteBoundaryState {
    return {
      error,
      resetKey: 0,
    };
  }

  componentDidCatch(error: unknown) {
    console.error('[ROUTE_BOUNDARY] Route error captured:', error);
  }

  reset = () => {
    this.setState((current) => ({
      error: null,
      resetKey: current.resetKey + 1,
    }));
  };

  render() {
    const { error, resetKey } = this.state;

    if (error) {
      if (isNotFoundRouteError(error)) {
        return <NotFoundPage key={resetKey} />;
      }

      return <ErrorPage key={resetKey} error={error} reset={this.reset} />;
    }

    return <React.Fragment key={resetKey}>{this.props.children}</React.Fragment>;
  }
}
