import React, { lazy, Suspense, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function lazyWithFallback(factory, FallbackComponent) {
  const LazyComponent = lazy(factory);

  return (props) => {
    const navigate = useNavigate();
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      if (hasError) {
        navigate("/", { replace: true });
      }
    }, [hasError, navigate]);

    return (
      <Suspense
        fallback={<FallbackComponent {...props} />}
      >
        <ErrorBoundary onError={() => setHasError(true)}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) this.props.onError(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
