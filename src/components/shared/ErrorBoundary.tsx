import * as React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ACAS] Unhandled error:", error, info);
  }

  private reset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl">
            <AlertTriangle className="h-8 w-8 text-gold-400" />
          </div>
          <h1 className="text-lg font-bold">Something went wrong</h1>
          <p className="max-w-xs text-sm text-muted-foreground">{this.state.message ?? "An unexpected error occurred."}</p>
          <button onClick={this.reset} className="btn-gold rounded-lg px-6 py-2.5 text-sm">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
