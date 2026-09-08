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
        //GARANTE TELA CHEIA - TIRA AS BARREIRAS
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        //pede a chabe do motor de vibração ao sistema e guarda pra quando precisar utilizar
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);


        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom); // inserindo margens auto PRA NÃO FICAR ESCONDIDO DAS CAM E
            return insets;
        });

        //busca a tela web e guarda dentro da var webView
        webView = findViewById(R.id.webview);
        // utiliza a var pra abri o painel de  configs  do webview
        WebSettings ws = webView.getSettings();

        // Configurações básicas da lógica do jogo
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);

        // Permite que o JavaScript leia dados de outros ficheiros locais dentro da pasta assets
        ws.setAllowFileAccess(true);
        ws.setAllowFileAccessFromFileURLs(true);
        ws.setAllowUniversalAccessFromFileURLs(true);

        // Força a abertura de links e novas páginas dentro do próprio WebView, em vez de abrir o Google Chrome
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        webView.addJavascriptInterface(new WebAppInterface(this, vibrator), "Android"); //passa o controle pro script do jogo
        webView.loadUrl("file:///android_asset/index.html");
    }

    //é o codigo que permite o app.js mandar ordens pro hardware do celular
    public static class WebAppInterface {
        private final Context ctx;
        private final Vibrator vibrator;

        public WebAppInterface(Context ctx, Vibrator vibrator) {
            this.ctx = ctx;
            this.vibrator = vibrator;
        }

        // Autoriza o seu app.js a chamar esta função
        @JavascriptInterface
        public void vibrate(long ms) {
            try {
                // Se o celular não tiver motor de vibração, ignora
                if (vibrator == null) return;

                // Usa o comando moderno para Androids novos, ou o antigo para Androids velhos
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(ms);
                }
            } catch (Exception ignored) {}
        }

        // Função para vibrações com ritmo
        @JavascriptInterface
        public void vibratePattern(String patternJson) {
            try {
                if (vibrator == null) return;

                // Converte a lista enviada pelo JavaScript em tempos de vibração
                JSONArray arr = new JSONArray(patternJson);
                long[] pattern = new long[arr.length()];
                for (int i = 0; i < arr.length(); i++) pattern[i] = arr.getLong(i);

                // Toca o ritmo no motor do celular
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
                } else {
                    vibrator.vibrate(pattern, -1);
                }
            } catch (Exception ignored) {} // Proteção contra travamentos
        }
    }
}