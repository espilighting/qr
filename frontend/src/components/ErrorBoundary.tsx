import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log('Error capturado en ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Algo salió mal. Por favor, intenta nuevamente más tarde.</h2>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
