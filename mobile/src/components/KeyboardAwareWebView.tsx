import React from 'react';
import WebView, { WebViewProps } from 'react-native-webview';

// Keyboard handling is done entirely on the web side via the Visual Viewport API.
// KeyboardAvoidingView caused double-compensation bugs (native shrinks WebView AND
// the web added padding), so we let the keyboard overlay the WebView and rely on
// --app-height CSS variable to resize the layout.
const KeyboardAwareWebView = React.forwardRef<WebView, WebViewProps>((props, ref) => {
  return <WebView ref={ref} {...props} />;
});

KeyboardAwareWebView.displayName = 'KeyboardAwareWebView';

export default KeyboardAwareWebView;
