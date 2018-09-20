package com.aprrow;

import android.app.Application;

import com.aprrow.Toast.Toastpackage;
import com.facebook.react.ReactApplication;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;

import com.psykar.cookiemanager.CookieManagerPackage;

import com.kevinejohn.RNMixpanel.RNMixpanel;
import io.fixd.rctlocale.RCTLocalePackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.bugsnag.BugsnagReactNative;
import com.RNFetchBlob.RNFetchBlobPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.dooboolab.RNIap.RNIapPackage;
import cl.json.RNSharePackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import im.shimo.react.prompt.RNPromptPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.github.xfumihiro.react_native_image_to_base64.ImageToBase64Package;
import com.imagepicker.ImagePickerPackage;
import com.airlabsinc.RNAWSCognitoPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import org.pgsqlite.SQLitePluginPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import java.util.Arrays;
import java.util.List;

import com.facebook.CallbackManager;
import com.facebook.appevents.AppEventsLogger;
import com.opensettings.OpenSettingsPackage;

public class MainApplication extends Application implements ReactApplication {
  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new ReactNativeLocalizationPackage(),
            new SplashScreenReactPackage(),
            new CookieManagerPackage(),
            new RNMixpanel(),
            new RCTLocalePackage(),
            new PickerPackage(),
            BugsnagReactNative.getPackage(),
            new RNFetchBlobPackage(),
            new RNGoogleSigninPackage(),
            new ReactNativePushNotificationPackage(),
            new RNIapPackage(),
            new RNSharePackage(),
            new ReactNativeContacts(),
            new RNPromptPackage(),
            new FBSDKPackage(mCallbackManager),
            new BackgroundTimerPackage(),
            new RNDeviceInfo(),
            new ImageToBase64Package(),
            new ImagePickerPackage(),
            new SQLitePluginPackage(),
            new Toastpackage(),
            new RNAWSCognitoPackage(),
            new OpenSettingsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
  //  FacebookSdk.sdkInitialize(getApplicationContext());
    
    AppEventsLogger.activateApp(this);
    BugsnagReactNative.start(this);
    SoLoader.init(this, /* native exopackage */ false);
  }
}
