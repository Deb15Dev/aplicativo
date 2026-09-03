package com.example.aplicativo;


import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient; // Importação adicionada
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient; // Importação adicionada

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import org.json.JSONArray;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private Vibrator vibrator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        webView = findViewById(R.id.webview);
        WebSettings ws = webView.getSettings();

        // Configurações básicas
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);

        // Permite que o JavaScript leia dados de outros ficheiros locais (ex: dados das palavras cruzadas em JSON)
        ws.setAllowFileAccessFromFileURLs(true);
        ws.setAllowUniversalAccessFromFileURLs(true);

        // Força a abertura de links e novas páginas dentro do próprio WebView, em vez de abrir o Google Chrome
        webView.setWebViewClient(new WebViewClient());

        // Habilita alertas JS (alert, prompt, confirm) e recursos avançados de renderização HTML5
        webView.setWebChromeClient(new WebChromeClient());

        webView.addJavascriptInterface(new WebAppInterface(this, vibrator), "Android");
        webView.loadUrl("file:///android_asset/index.html");
    }

    public static class WebAppInterface {
        private final Context ctx;
        private final Vibrator vibrator;

        public WebAppInterface(Context ctx, Vibrator vibrator) {
            this.ctx = ctx;
            this.vibrator = vibrator;
        }

        @JavascriptInterface
        public void vibrate(long ms) {
            try {
                if (vibrator == null) return;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    //noinspection deprecation
                    vibrator.vibrate(ms);
                }
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void vibratePattern(String patternJson) {
            try {
                if (vibrator == null) return;
                JSONArray arr = new JSONArray(patternJson);
                long[] pattern = new long[arr.length()];
                for (int i = 0; i < arr.length(); i++) pattern[i] = arr.getLong(i);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
                } else {
                    //noinspection deprecation
                    vibrator.vibrate(pattern, -1);
                }
            } catch (Exception ignored) {}
        }
    }
}