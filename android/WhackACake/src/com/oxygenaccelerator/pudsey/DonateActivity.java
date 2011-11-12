package com.oxygenaccelerator.pudsey;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.telephony.SmsManager;
import android.view.View;
import android.widget.Button;


public class DonateActivity extends Activity {

	 /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.donate);
        
        
        final Button dial_button = (Button) findViewById(R.id.button_donate_via_phoneline);
        dial_button.setOnClickListener(new View.OnClickListener() {
        	

			@Override
			public void onClick(View v) {
			      Intent dialIntent = new Intent( "android.intent.action.DIAL",Uri.parse("tel:  03457332233")); 
			        startActivity(dialIntent);
	        }
				
			});


        final Button text_button = (Button) findViewById(R.id.button_donate_via_text);
        text_button.setOnClickListener(new View.OnClickListener() {
        	

			@Override
			public void onClick(View v) {
				
				Intent smsIntent = new Intent(Intent.ACTION_VIEW);
				smsIntent.setType("vnd.android-dir/mms-sms");
				smsIntent.putExtra("address", "70705");
				smsIntent.putExtra("sms_body","DONATE");
				startActivity(smsIntent);
				
				
	        }
				
			});


        

        
      
        
    }
	
}
