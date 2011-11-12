package com.oxygenaccelerator.pudsey;

import java.io.File;
import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;



public class GameActivity  extends Activity{
	
	 @Override
	    public void onCreate(Bundle savedInstanceState) {
	        super.onCreate(savedInstanceState);
	        
	        setContentView(R.layout.game);
	        
	        WebView webview = (WebView) findViewById(R.id.webview);
	        
	        
	        webview.loadUrl("file:///android_asset/test.html");
	        
	        
	        /*
	        WebView webview = (WebView) findViewById(R.id.webview);
	        
	        File f = new File("file:///android_asset/test.html");
	        
	        String exists = "does not exist";
	        
	        if (f.exists()) {
	        	exists = "exists";
	        }
	        
	        Log.d("GameActivity",exists);
	        
	       // webview.loadUrl("file:///android_asset/test.html");
	        */
	        
	 }

}
