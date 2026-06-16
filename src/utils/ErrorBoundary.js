// /src/utils/ErrorBoundary.js
// ATUALIZADO: Usa ErrorState do Indicators.js em vez de componente interno

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ErrorState } from '../components/Indicators';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para serviço de monitoramento (Sentry, Crashlytics, etc.)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ErrorState
            icon="💥"
            title="Algo deu errado"
            message={this.state.error?.message || 'Ocorreu um erro inesperado. Tente novamente.'}
            onRetry={this.handleRetry}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ErrorBoundary;