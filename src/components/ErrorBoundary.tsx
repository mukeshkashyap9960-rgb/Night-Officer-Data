import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Crime Branch application:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear storage:', e);
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-950/50">
              <ShieldAlert size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">સિસ્ટમ લોડિંગમાં ક્ષતિ (Application Error)</h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                એપ્લિકેશન શરૂ કરતી વખતે અનપેક્ષિત ક્ષતિ આવી છે. નીચે આપેલા બટન પર ક્લિક કરીને રિલોડ કરો અથવા કેશ રીસેટ કરો.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left font-mono text-xs text-rose-400 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw size={16} />
                <span>ફરી રિલોડ કરો (Reload)</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetCache}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 size={16} />
                <span>રીસેટ ડેટા (Reset)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
