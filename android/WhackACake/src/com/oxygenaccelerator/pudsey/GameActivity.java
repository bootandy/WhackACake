package com.oxygenaccelerator.pudsey;

import java.io.File;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;



public class GameActivity  extends Activity{
	
	private static final String LOG_TAG = "GameActivity";
	
	 @Override
	    public void onCreate(Bundle savedInstanceState) {
	        super.onCreate(savedInstanceState);
	        
	        setContentView(R.layout.game);
	            
	        
	        final WebView webview = (WebView) findViewById(R.id.webview);
	        
	        WebSettings ws = webview.getSettings();
	        
	        ws.setJavaScriptEnabled(true);
	        
	        webview.setWebChromeClient(new MyWebChromeClient());
	        
	        /* WebViewClient must be set BEFORE calling loadUrl! */  
	        webview.setWebViewClient(new WebViewClient() {  
	            @Override  
	            public void onPageFinished(WebView view, String url)  
	            {  
	                webview.loadUrl("javascript:(function() { " +  
	                        "whackacake.init(); " +  
	                        "})()");  
	            }  
	        });  
	        
	        
	        webview.loadUrl("file:///android_asset/index.html");
	        
	               
	 }
	 
	 final class MyWebChromeClient extends WebChromeClient {
	        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
	            Log.d(LOG_TAG, message);
	            result.confirm();
	            return true;
	        }
	    }
	 
	 
	 

}
