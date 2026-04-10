import React from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../ThemeContext';

const ArticleScreen = ({ route }) => {
  const url = route?.params?.url;
  const { theme } = useTheme();

  if (!url) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.text }}>Article URL is not available.</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: url }}
      startInLoadingState
      renderLoading={() => (
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      )}
    />
  );
};

export default ArticleScreen;