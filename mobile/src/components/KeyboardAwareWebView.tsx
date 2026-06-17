import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';

const KeyboardAwareWebView = React.forwardRef<WebView, WebViewProps>((props, ref) => {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'height' : undefined}
    >
      <WebView ref={ref} {...props} />
    </KeyboardAvoidingView>
  );
});

KeyboardAwareWebView.displayName = 'KeyboardAwareWebView';

export default KeyboardAwareWebView;

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
