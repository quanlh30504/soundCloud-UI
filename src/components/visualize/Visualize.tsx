import { set } from 'date-fns';
import React, { useRef, useEffect } from 'react';
import { View, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface VisualizeProps {
  audioUrl?: string;
  isPlaying: boolean;
  position: number;
  volume?: number;
}

export const Visualize: React.FC<VisualizeProps> = ({ 
  audioUrl, 
  isPlaying, 
  position, 
  volume = 0 
}) => {
  const webViewRef = useRef<WebView>(null);
  const { width } = Dimensions.get('window');
  const lastPositionRef = useRef<number>(0);
  const [isWebViewReady, setIsWebViewReady] = React.useState(false);
  
  // Load audio when URL changes
  useEffect(() => {
    if (audioUrl && webViewRef.current && isWebViewReady) {
      const message = JSON.stringify({
        type: 'LOAD_AUDIO',
        url: audioUrl
      });
      webViewRef.current.postMessage(message);
    } else {
      if (!audioUrl) {
        console.warn("No audio URL provided.");
      }
    }
  }, [audioUrl, isWebViewReady]);

  // Handle play/pause state
  useEffect(() => {
    console.log(isPlaying ? "Playing" : "Paused");
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: isPlaying ? 'PLAY' : 'PAUSE'
      });
      webViewRef.current.postMessage(message);
    }
  }, [isPlaying]);

  // Handle position changes (seeking)
  useEffect(() => {
    if (webViewRef.current && Math.abs(position - lastPositionRef.current) > 1) {
      const message = JSON.stringify({
        type: 'SEEK',
        position: position,
        isPlaying: isPlaying
      });
      webViewRef.current.postMessage(message);
    }
    lastPositionRef.current = position;
  }, [position]);

  // Handle volume changes
  useEffect(() => {
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: 'SET_VOLUME',
        volume: volume
      });
      webViewRef.current.postMessage(message);
    }
  }, [volume]);

  return (
    <View style={{ height: 150, width: width-20, backgroundColor: '#121212', marginHorizontal: 10 }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={require('./assets/index.html')}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ width, height: 150, backgroundColor: '#121212'}}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'DOMContentLoaded') {
            setIsWebViewReady(true);
            console.log("WebView is ready");
          } else {
            console.log("From Visualizer WebView:", event.nativeEvent.data);
          }
        }}
      />
    </View>
  );
};