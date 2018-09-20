package com.aprrow.Toast;

/**
 * Created by DhisigmaLP001 on 18-01-2018.
 */
import android.app.Activity;
import android.app.AppOpsManager;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.appwidget.AppWidgetManager;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Environment;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.widget.Toast;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;

import com.aprrow.widget.homescreewidget;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.graphics.drawable.Drawable;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Currency;
import java.util.LinkedList;
import java.util.List;

import java.util.Locale;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

import static android.app.Activity.RESULT_CANCELED;
import static android.app.Activity.RESULT_OK;
import static android.app.AppOpsManager.MODE_ALLOWED;
import static android.app.AppOpsManager.OPSTR_GET_USAGE_STATS;
import static android.content.Context.LOCATION_SERVICE;
import static android.os.Process.myUid;

public class ToastModule extends ReactContextBaseJavaModule  {

    private final ReactApplicationContext reactContext;
    private Context mContext;

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    private static  final int UNINSTAL_APP_ACTIVITY=1;
    private static  final int USAGE_APP_ACTIVITY=10;

    private Promise Uninstal_appPromise;
    private Promise USAGE_appPromise;

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == UNINSTAL_APP_ACTIVITY) {
                if (Uninstal_appPromise != null) {
                    if (resultCode == RESULT_CANCELED) {
                    //    Toast.makeText(reactContext,"fail",Toast.LENGTH_SHORT).show();
                        Uninstal_appPromise.resolve("false");
                    } else if (resultCode == RESULT_OK) {
                    //    Toast.makeText(reactContext,"done",Toast.LENGTH_SHORT).show();
                        Uninstal_appPromise.resolve("true");

                    }

                    Uninstal_appPromise = null;
                }
            }
        else if (requestCode == USAGE_APP_ACTIVITY) {
            if (USAGE_appPromise != null) {
                if (resultCode == RESULT_CANCELED) {
                    //    Toast.makeText(reactContext,"fail",Toast.LENGTH_SHORT).show();
                    USAGE_appPromise.resolve("false");
                } else if (resultCode == RESULT_OK) {
                    //    Toast.makeText(reactContext,"done",Toast.LENGTH_SHORT).show();
                    USAGE_appPromise.resolve("true");

                }

                USAGE_appPromise = null;
            }
        }
    }




    };



@ReactMethod
    public void getCurrentCountryCode(Promise promise) {
        try {
            TelephonyManager tm = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
            String countryCodeValue = tm.getNetworkCountryIso();
            promise.resolve(""+countryCodeValue);
           }
        catch (Exception e)
        {
            promise.reject( e);

        }
    }
    @ReactMethod
    public void getCurrentCurrencyCode(Promise promise) {
        try {
            TelephonyManager tm = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
            String countryCodeValue = tm.getNetworkCountryIso();
           //   Toast.makeText(reactContext, "YYYY:" + countryCodeValue, Toast.LENGTH_SHORT).show();
          //  Log.d(TAG, "TESTCOUNTRY=>"+countryCodeValue);
            Currency currency=null;
         if(countryCodeValue!=""&&countryCodeValue!=null) {
             Locale locale = new Locale("", countryCodeValue);
             currency = Currency.getInstance(locale);

         }
            promise.resolve(""+currency);

         }
        catch (Exception e)
        {
            promise.reject( e);

        }
     }




    public ToastModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(mActivityEventListener);
    }

    @Override
    public String getName() {
        return "ToastModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }

    @ReactMethod
    public void show(String message, int duration) {
        Toast.makeText(getReactApplicationContext(), message, duration).show();
    }

    //get app statisticsdata
    @ReactMethod
    public void getappstatistics(Promise promise) {
        try {
            PackageManager packageManager = this.reactContext.getPackageManager();
            List<PackageInfo> packageList = packageManager
                    .getInstalledPackages(PackageManager.GET_PERMISSIONS);


            JSONArray appdata=new JSONArray();
            Map<String, Long> usageMap = new HashMap<>();
            Map<String, UsageStats> stats=new HashMap<>();
            if(hasStatsPermission(reactContext))
            {
                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.MONTH, -1);
                long start = calendar.getTimeInMillis();
                long end = System.currentTimeMillis();

                // Get amount of time that each process has spent in the foreground during the time frame.
                UsageStatsManager usageStatsManager =
                        (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
                stats = usageStatsManager.queryAndAggregateUsageStats(start, end);

                for (Map.Entry<String, UsageStats> entry : stats.entrySet()) {
                    String s1 = entry.getKey();
                    Long s2 = entry.getValue().getTotalTimeInForeground();
                    usageMap.put(s1, s2);
                }



            }



            for(PackageInfo pinf:packageList)
            {

                if(this.reactContext.getPackageManager().getLaunchIntentForPackage(pinf.packageName) != null) {


                    JSONObject appobj = new JSONObject();
                    String appName = packageManager.getApplicationLabel(
                            pinf.applicationInfo).toString();

                    String packageName = pinf.packageName;


              //      Drawable appIcon = packageManager
              //              .getApplicationIcon(pinf.applicationInfo);

               //     Bitmap myLogo = ((BitmapDrawable) appIcon).getBitmap();

               //     ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
               //     myLogo.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
               //     byte[] byteArray = byteArrayOutputStream .toByteArray();

                 //   String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);

                    appobj.put("usage",0);
                    appobj.put("lastimeused","NA");
                    if(usageMap.containsKey(packageName)) {
                        appobj.put("usage", usageMap.get(packageName));
                        appobj.put("lastimeused",stats.get(packageName).getLastTimeUsed());

                    }
                   // appobj.put("icon",encoded);
                    appobj.put("applabel", appName);
                    appobj.put("package", packageName);
                    appdata.put(appobj);
                }
            }

            promise.resolve(appdata.toString());
        } catch (Exception e) {
            promise.reject( e);
        }
    }

    //get apps used in last 5 minutes
    @ReactMethod
    public void getappsusedinlastfiveminutes(Promise promise) {
        try {
			
            JSONArray usagedata=new JSONArray();
            PackageManager pm = this.reactContext.getPackageManager();
           // ApplicationInfo ai;
                  
            Map<String, UsageStats> stats=new HashMap<>();
            if(hasStatsPermission(reactContext))
            {

                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.MONTH, -1);
                long start = calendar.getTimeInMillis();
                long end = System.currentTimeMillis();



                // Get amount of time that each process has spent in the foreground during the time frame.
                UsageStatsManager usageStatsManager =
                        (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
                stats = usageStatsManager.queryAndAggregateUsageStats(start, end);

                for (Map.Entry<String, UsageStats> entry : stats.entrySet()) {
                    JSONObject usageobj = new JSONObject();
                    String s1 = entry.getKey();
                    Long s2 = entry.getValue().getTotalTimeInForeground();
                    Long lasttimeused = entry.getValue().getLastTimeUsed();
                    //String appName = packageManager.getApplicationLabel(entry.applicationInfo).toString();
                    
                   
                       // ai = pm.getApplicationInfo( s1, 0);
                        
                         //String applicationName ="test";//(String) (ai != null ? pm.getApplicationLabel(ai) : "(unknown)");

                    usageobj.put("appname","unknown");
                    usageobj.put("packagename", s1);
                    usageobj.put("time", s2);
                    usageobj.put("lasttimeused", lasttimeused);
                    if (System.currentTimeMillis() - lasttimeused <= 300000 && this.reactContext.getPackageManager().getLaunchIntentForPackage(s1) != null) {

                        String app_name = (String)pm.getApplicationLabel(
                                pm.getApplicationInfo(s1
                                        , PackageManager.GET_META_DATA));
                        usageobj.put("appname",app_name);
                        usagedata.put(usageobj);//10000
                    }
                }

            }
            promise.resolve(usagedata.toString());
        } catch (Exception e) {
           // Toast.makeText(reactContext,e.getMessage(),Toast.LENGTH_SHORT);
            promise.reject( e);

        }
    }


 
      @ReactMethod
        private void isNotificationServiceRunning(Promise promise) {

          Activity currentActivity = getCurrentActivity();
          Intent intent = new Intent();
          intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
          intent.putExtra("app_package", currentActivity.getPackageName());
          intent.putExtra("app_uid", currentActivity.getApplicationInfo().uid);
          intent.putExtra("android.provider.extra.APP_PACKAGE", currentActivity.getPackageName());

          currentActivity.startActivity(intent);
        /*  reactContext.startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS));
          ContentResolver contentResolver;
          contentResolver =this.reactContext.getContentResolver();
          String enabledNotificationListeners = Settings.Secure.getString(contentResolver, "enabled_notification_listeners");
        String packageName = this.reactContext.getPackageName();
        Toast.makeText(reactContext,packageName,Toast.LENGTH_SHORT);
          promise.resolve(enabledNotificationListeners != null && enabledNotificationListeners.contains(packageName)); */
        //return enabledNotificationListeners != null && enabledNotificationListeners.contains(packageName);
        } 
    
   
     @ReactMethod
     public void appUnInstaller(String packageName,final Promise promise)
     {   //Toast.makeText(reactContext, "Could not launch application", Toast.LENGTH_SHORT).show();
         //String package = packageName;

         Uninstal_appPromise=promise;
         Activity currentActivity = getCurrentActivity();
         Intent intent = new Intent(Intent.ACTION_DELETE); 
         intent.setData(Uri.parse("package:"+packageName)); 
         intent.putExtra(Intent.EXTRA_RETURN_RESULT, true);
         currentActivity.startActivityForResult(intent,UNINSTAL_APP_ACTIVITY);
     }


     @ReactMethod
     public  void write_logs(String content ,String filename,Promise promise) {
         File root = Environment.getExternalStorageDirectory();

         File dir = new File(root.getAbsolutePath() + "/logs/");
         if (!dir.exists()) {
           boolean iscreated=   dir.mkdirs();
         }

         File file = new File(dir, filename+".txt");




         try {

             FileOutputStream f = new FileOutputStream(file,true);
             PrintWriter pw = new PrintWriter(f);
             pw.println(content);
             pw.flush();
             pw.close();
             f.close();
             promise.resolve("done");
         } catch (FileNotFoundException e) {
             promise.reject(e);

             e.printStackTrace();
         } catch (IOException e) {
             promise.reject(e);
             e.printStackTrace();
         }

     }

    @ReactMethod
    public void getapps(
            Callback errorCallback,
            Callback successCallback) {
        try {
            PackageManager packageManager = this.reactContext.getPackageManager();
            List<PackageInfo> packageList = packageManager
                    .getInstalledPackages(PackageManager.GET_PERMISSIONS);


            JSONArray appdata=new JSONArray();
            Map<String, Long> usageMap = new HashMap<>();
            Map<String, UsageStats> stats=new HashMap<>();
            if(hasStatsPermission(reactContext))
            {
                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.MONTH, -1);
                long start = calendar.getTimeInMillis();
                long end = System.currentTimeMillis();

                // Get amount of time that each process has spent in the foreground during the time frame.
                UsageStatsManager usageStatsManager =
                        (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
                stats = usageStatsManager.queryAndAggregateUsageStats(start, end);

                for (Map.Entry<String, UsageStats> entry : stats.entrySet()) {
                    String s1 = entry.getKey();
                    Long s2 = entry.getValue().getTotalTimeInForeground();
                    usageMap.put(s1, s2);
                }



            }


            File rootsd = reactContext.getFilesDir();
            File direct = new File(rootsd.getAbsolutePath() + "/icon_cache");
            if (!direct.exists()) {
                direct.mkdirs();
            }

            for(PackageInfo pinf:packageList)
            {

                if(this.reactContext.getPackageManager().getLaunchIntentForPackage(pinf.packageName) != null) {


                    JSONObject appobj = new JSONObject();
                    String appName = packageManager.getApplicationLabel(
                            pinf.applicationInfo).toString();

                    if(appName!=null&&appName.length()>18)
                        appName=appName.substring(0,18);

                    String packageName = pinf.packageName;


                    Drawable appIcon = packageManager
                            .getApplicationIcon(pinf.applicationInfo);





                    String fileName=packageName+".png";
                    File file = new File(direct, fileName);
                    if (!file.exists()) {

                        Bitmap myLogo = null;

                        if (appIcon instanceof BitmapDrawable) {
                            myLogo = ((BitmapDrawable) appIcon).getBitmap();

                        } else {
                            final Bitmap bmp = Bitmap.createBitmap(appIcon.getIntrinsicWidth(), appIcon.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
                            final Canvas canvas = new Canvas(bmp);
                            appIcon.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                            appIcon.draw(canvas);

                            myLogo = bmp;
                        }

                        try {
                            FileOutputStream out = new FileOutputStream(file);
                            myLogo.compress(Bitmap.CompressFormat.PNG, 100, out);
                            out.flush();
                            out.close();
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        
                    }


                   // ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                   // myLogo.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
                  //  byte[] byteArray = byteArrayOutputStream .toByteArray();

                 //   String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);

                    appobj.put("usage",0);
                    appobj.put("lastimeused","NA");
                    if(usageMap.containsKey(packageName)) {
                        appobj.put("usage", usageMap.get(packageName));
                        appobj.put("lastimeused",stats.get(packageName).getLastTimeUsed());

                    }
                    appobj.put("icon",file.getAbsolutePath());
                    appobj.put("applabel", appName);
                    appobj.put("package", packageName);
                    appdata.put(appobj);
                }
            }

            successCallback.invoke(appdata.toString());
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }


    //getuuid
    @ReactMethod
    public void uuid( Promise promise) {
        try {
            String uuid= UUID.randomUUID().toString();
            promise.resolve(uuid);
            //successCallback.invoke(uuid);
        }
        catch (Exception e)
        {
            //errorCallback.invoke(e.getMessage());
            promise.reject( e);
        }

    }


    @ReactMethod
    public void checkappusagepermission( Promise promise) {
        try {
            if(hasStatsPermission(reactContext))
                promise.resolve(true);
            else
                promise.resolve(false);

        }
        catch (Exception e)
        {
            //errorCallback.invoke(e.getMessage());
            promise.reject( e);
        }

    }



    @ReactMethod
    public void askpermission( Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            USAGE_appPromise=promise;
            Intent intent=new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            currentActivity.startActivityForResult(intent,USAGE_APP_ACTIVITY);
          //  promise.resolve("done");
        }
        catch (Exception e)
        {
           // promise.reject( e);
        }

    }

    @ReactMethod
    public void askpermissionforGPS( Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            currentActivity.startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS));
            promise.resolve("done");
        }
        catch (Exception e)
        {
            promise.reject( e);
        }

    }
    @ReactMethod
    public void checkstatusof_GPS( Promise promise) {
        try {
            LocationManager service = (LocationManager)getCurrentActivity().getSystemService(LOCATION_SERVICE);
            boolean enabled = service.isProviderEnabled(LocationManager.GPS_PROVIDER);
            promise.resolve(enabled);
        }
        catch (Exception e)
        {
            //errorCallback.invoke(e.getMessage());
            promise.reject( e);
        }

    }

    @ReactMethod
    public void getmostusedapps( Promise promise) {

        try {
            JSONArray apps=new JSONArray();
            if(!hasStatsPermission(reactContext)) {

                promise.resolve(apps.toString());

            }

            else {
                Calendar calendar = Calendar.getInstance();
                calendar.add(Calendar.MONTH, -1);
                long start = calendar.getTimeInMillis();
                long end = System.currentTimeMillis();

                // Get amount of time that each process has spent in the foreground during the time frame.
                UsageStatsManager usageStatsManager =
                        (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
                Map<String, UsageStats> stats = usageStatsManager.queryAndAggregateUsageStats(start, end);
                Map<String, Long> usageMap = new HashMap<>();
                for (Map.Entry<String, UsageStats> entry : stats.entrySet()) {
                    String s1 = entry.getKey();
                    Long s2 = entry.getValue().getTotalTimeInForeground();
                    usageMap.put(s1, s2);
                }

                // Sort apps by the amount of time they have spent in the foreground.
                List<String> sortedApps = (new AppUsageComparator()).sortAppUsage(usageMap);

                // Filter out system processes so that only applications are shown.
                PackageManager packageManager = reactContext.getPackageManager();
                ArrayList<String> sortedVerifiedApps = new ArrayList<>();
                for (int i = 0; i < sortedApps.size(); i++) {
                    if (null != packageManager.getLaunchIntentForPackage(sortedApps.get(i))) {
                        sortedVerifiedApps.add(sortedApps.get(i));
                    }
                }

                // Limit the number of applications added to a widget.
                if (sortedVerifiedApps.size() > 24) {
                    sortedVerifiedApps.subList(24, sortedVerifiedApps.size()).clear();
                }


                ApplicationInfo ai;
                for (int i = 0; i < sortedVerifiedApps.size(); i++) {
                    JSONObject obj = new JSONObject();
                    String appname="unknown";
                    try {
                        ai = packageManager.getApplicationInfo( sortedVerifiedApps.get(i), 0);

                        appname= packageManager.getApplicationLabel(
                                ai).toString();

                    } catch (final PackageManager.NameNotFoundException e) {
                        ai = null;
                    }

                    obj.put("package", sortedVerifiedApps.get(i));
                    obj.put("applabel", appname);
                    apps.put(obj);
                }


                promise.resolve(apps.toString());
            }
            //successCallback.invoke(uuid);
        }
        catch (Exception e)
        {
            //errorCallback.invoke(e.getMessage());
            promise.reject( e);
        }

    }


   @ReactMethod
   public  void updateHomeScreenWidgets(Promise promise) {
       try {
           AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(reactContext);
           int[] ids = getHomeScreenWidgetIds(reactContext);
           homescreewidget widgetProvider = new homescreewidget();
           widgetProvider.onUpdate(reactContext, appWidgetManager, ids);
           promise.resolve("done");
       }
       catch (Exception e)
       {
           promise.reject( e);
       }
   }

   @ReactMethod
   public void launchapp(String appPackage )
   {
       try {
           Activity currentActivity = getCurrentActivity();
           PackageManager packageManager =currentActivity.getPackageManager();
           Intent launchIntent = packageManager.getLaunchIntentForPackage(appPackage);
           if(launchIntent != null) {
               currentActivity.startActivity(launchIntent);
           } else {


               try {
                   currentActivity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + appPackage)));
               } catch (android.content.ActivityNotFoundException anfe) {
                   currentActivity.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + appPackage)));
               }


           }
       } catch (ActivityNotFoundException e) {
           Toast.makeText(reactContext, "Could not launch application", Toast.LENGTH_SHORT).show();
       }
   }


    public static int[] getHomeScreenWidgetIds(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        return appWidgetManager.getAppWidgetIds(new ComponentName(context, homescreewidget.class));
    }

   






    public static boolean hasStatsPermission(Context context) {
        AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(OPSTR_GET_USAGE_STATS, myUid(), context.getPackageName());
        return mode == MODE_ALLOWED;
    }



    public class AppUsageComparator implements Comparator<Map.Entry<String, Long>> {

        public List<String> sortAppUsage(Map<String, Long> usageStatistics) {

            List<String> appList;

            //if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) { // stream() added in API 24.
            //      appList = usageStatistics.entrySet().stream().sorted(
            //             (e1, e2) -> e2.getValue().compareTo(e1.getValue()))
            //             .map(Map.Entry::getKey)
            //             .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
            // } else {
            appList = sortAppUsagePreN(usageStatistics);
            // }

            return appList;
        }

        private List<String> sortAppUsagePreN(Map<String, Long> usageStatistics) {
            List<Map.Entry<String, Long>> sortedList = new LinkedList<>(usageStatistics.entrySet());

            Collections.sort(sortedList, this);

            ArrayList<String> appList = new ArrayList<>();

            for(Map.Entry<String, Long> entry : sortedList) {
                appList.add(entry.getKey());
            }

            return appList;
        }

        @Override
        public int compare(Map.Entry<String, Long> o1, Map.Entry<String, Long> o2) {
            // Sort largest to smallest.
            return o2.getValue().compareTo(o1.getValue());
        }
    }


}
