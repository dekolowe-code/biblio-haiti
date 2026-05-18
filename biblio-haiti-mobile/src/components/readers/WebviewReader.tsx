import React, { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, Platform, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebviewReaderProps {
  url: string;
  type: 'pdf' | 'epub' | 'audio';
  onProgress?: (progress: number) => void;
  title?: string;
}

export default function WebviewReader({ url, type, onProgress, title }: WebviewReaderProps) {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);

  // Pour Android, WebView ne lit pas les PDF nativement.
  // On utilise le viewer de Google Docs comme solution de contournement simple pour Expo Go.
  const getPdfUrl = () => {
    if (Platform.OS === 'android') {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Pour EPUB, nous injectons epub.js dans une page HTML locale
  const epubHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
      <style>
        body { margin: 0; padding: 0; background-color: #FFF8F0; overflow: hidden; font-family: sans-serif; }
        #viewer { width: 100vw; height: 100vh; }
        .controls { position: fixed; bottom: 20px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 20px; pointer-events: none; z-index: 10; }
        .btn { background: rgba(0,0,0,0.1); border: none; width: 40px; height: 40px; border-radius: 20px; font-size: 20px; pointer-events: auto; }
      </style>
    </head>
    <body>
      <div id="viewer"></div>
      <div class="controls">
        <button class="btn" onclick="rendition.prev()">‹</button>
        <button class="btn" onclick="rendition.next()">›</button>
      </div>
      <script>
        var book = ePub("${url}");
        var rendition = book.renderTo("viewer", {
          width: "100%",
          height: "100%",
          spread: "none",
          manager: "continuous",
          flow: "paginated"
        });
        
        rendition.display();

        rendition.on("relocated", function(location) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'progress',
            percentage: location.start.percentage
          }));
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View className="flex-1 bg-background relative">
      {loading && (
        <View className="absolute inset-0 items-center justify-center z-10 bg-background/80">
          <ActivityIndicator size="large" color="#C41E3A" />
        </View>
      )}
      
      {type === 'pdf' ? (
        <WebView
          source={{ uri: getPdfUrl() }}
          onLoadEnd={() => setLoading(false)}
          className="flex-1"
          scalesPageToFit={true}
        />
      ) : type === 'epub' ? (
        <WebView
          ref={webViewRef}
          source={{ html: epubHtml }}
          onLoadEnd={() => setLoading(false)}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'progress' && onProgress) {
                // epub.js renvoie un pourcentage de 0 à 1
                onProgress(data.percentage * 100);
              }
            } catch (e) {}
          }}
          className="flex-1"
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>Format non supporté dans le lecteur webview.</Text>
        </View>
      )}
    </View>
  );
}
