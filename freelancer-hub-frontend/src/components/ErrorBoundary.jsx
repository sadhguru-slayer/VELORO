import React, { Component } from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-[200px] flex flex-col items-center justify-center p-6 rounded-lg bg-violet-50 border border-violet-200"
        >
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-violet-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-violet-600 mb-4">
              We're working on fixing this issue. Please try again later.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
            >
              Retry
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-violet-100 rounded text-sm text-violet-800 w-full max-w-2xl overflow-auto">
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
          )}
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;