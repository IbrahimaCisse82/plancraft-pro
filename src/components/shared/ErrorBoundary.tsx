import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { logError } from "@/lib/errorLogger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    logError({
      message: error.message || "Unknown React error",
      stack: error.stack,
      context: { componentStack: errorInfo.componentStack?.slice(0, 2000) },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="font-display text-2xl font-bold mb-2">Une erreur est survenue</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error?.message || "Quelque chose s'est mal passé."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-5 py-2.5 bg-primary rounded-lg text-sm font-bold text-primary-foreground hover:opacity-90 transition-all"
              >
                Réessayer
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 bg-secondary border border-border rounded-lg text-sm font-semibold text-secondary-foreground hover:border-primary transition-all"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
