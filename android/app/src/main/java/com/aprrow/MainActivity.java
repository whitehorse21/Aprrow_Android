package com.aprrow;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main co0.-mponent registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Approw";
    }
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }
    @Override
    protected void onStart() {
        super.onStart();

    }

    public class TestActivityDelegate extends ReactActivityDelegate {
        // private homescreewidget anotherClass;
        private static final String TEST1 = "Most Frequent";
        private static final String TEST2 = "Smart APRROW";
        private Bundle mInitialProps = null;
        private final
        Activity mActivity;
        public TestActivityDelegate(Activity activity, String mainComponentName) {
            super(activity, mainComponentName);
            this.mActivity = activity;
            // Toast.makeText(mActivity.getApplicationContext(), "test1", Toast.LENGTH_SHORT).show();
        }

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            //  anotherClass = new homescreewidget(this);
            SplashScreen.show(mActivity);
            //SplashActivity.show(this);
            Bundle bundle = mActivity.getIntent().getExtras();
          //  Toast.makeText(mActivity.getApplicationContext(), "create", Toast.LENGTH_SHORT).show();

            if (bundle != null ) {
                mInitialProps = new Bundle();
                //  Toast.makeText(mActivity.getApplicationContext(), bundle.getString(TEST1), Toast.LENGTH_SHORT).show();
                //   Toast.makeText(mActivity.getApplicationContext(), bundle.getString("widgetID"), Toast.LENGTH_SHORT).show();
                mInitialProps.putString("WidgetID", bundle.getString("widgetID"));
              //  Toast.makeText(mActivity.getApplicationContext(), "create", Toast.LENGTH_SHORT).show();

            }
            // SplashScreen.show(this);
            
            super.onCreate(savedInstanceState);
        }
        @Override
        protected Bundle getLaunchOptions() {
           // Toast.makeText(mActivity.getApplicationContext(), "LaunchAPp", Toast.LENGTH_SHORT).show();

            return mInitialProps;
        }

    }
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new TestActivityDelegate(this, getMainComponentName());
    }


}
