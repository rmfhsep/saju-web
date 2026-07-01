import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';

// iOS: KeyboardAvoidingView (behavior: 'height') 로 WebView를 키보드 위로 밀어올림.
// 웹 쪽 keyboard-footer CSS는 키보드 높이를 추가하지 않으므로 이중 처리 없음.
// Android: 네이티브 windowSoftInputMode="adjustResize" 가 처리하므로 그냥 패스스루.
const KeyboardAwareWebView = React.forwardRef<WebView, WebViewProps>((props, ref) => {
  if (Platform.OS !== 'ios') {
    return <WebView ref={ref} {...props} />;
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior="height">
      <WebView ref={ref} {...props} />
    </KeyboardAvoidingView>
  );
});

KeyboardAwareWebView.displayName = 'KeyboardAwareWebView';

export default KeyboardAwareWebView;

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
