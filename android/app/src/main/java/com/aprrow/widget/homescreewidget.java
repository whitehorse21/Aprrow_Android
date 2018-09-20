package com.aprrow.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.Toast;


import com.aprrow.Databasehelper;
import com.aprrow.MainActivity;
import com.aprrow.R;
import com.facebook.react.BuildConfig;


import java.io.File;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link homescreewidgetConfigureActivity homescreewidgetConfigureActivity}
 */
public class homescreewidget extends AppWidgetProvider {



    private static final String TAG = homescreewidget.class.getSimpleName();
    public static final String APPLICATION_PACKAGE = BuildConfig.APPLICATION_ID;
    public static final String ACTION_LAUNCH = APPLICATION_PACKAGE+ ".ACTION_LAUNCH";
    public static final String EXTRA_APP_PACKAGE = APPLICATION_PACKAGE + ".EXTRA_APP_PACKAGE";
    public static final String PREFS_NAME = "widgetids";
    public static  final String DATABASE_NAME="approw.db";
    private static final String GENERATED_ID ="generatedwidgetid" ;
    public static final String ACTION_FULLSCREEN = "ACTION_FULLSCREEN";


    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId, String titlePrefix) {
         // Log.d("update", "updateAppWidget appWidgetId=" + appWidgetId + " titlePrefix=" + titlePrefix);
        // Getting the string this way allows the string to be localized.  The format
        // string is filled in using java.util.Formatter-style format strings.
        //CharSequence text = context.getString(R.string.appwidget_text_format,ExampleAppWidgetConfigure.loadTitlePref(context, appWidgetId), "0x" + Long.toHexString(SystemClock.elapsedRealtime()));

        RemoteViews remoteViews = null;

        String widgetUuid = loadWidgetUuid(context, appWidgetId);
        widget widgetModel = loadWidget(context, widgetUuid);

        if(widgetModel == null) {
            remoteViews=new RemoteViews(context.getPackageName(), R.layout.widget_intial_layout);
            appWidgetManager.updateAppWidget(appWidgetId, remoteViews);
            return;
        }
        remoteViews=new RemoteViews(context.getPackageName(), R.layout.widget_standard);

        String  widgetname=widgetModel.widgetname;
        String  headerbackground=widgetModel.headerbackground;
        String  Backgroundpicture=widgetModel.backgroundpicture;
        String  widgetbackground=widgetModel.widgetbackground;

        remoteViews.setTextViewText(R.id.widgetTitle, widgetname);


        /*
         * get and passes widget ID with Home screen widget navigation
         * */
        Bundle extras = new Bundle();
         extras.putString("widgetID",widgetUuid);
       // extras.putInt("widgetID",widgetUuid);
        Intent intent1 = new Intent(context, homescreewidget.class);
        intent1.putExtras(extras);
        intent1.setAction(ACTION_FULLSCREEN);
        intent1.setData(Uri.parse(intent1.toUri(Intent.URI_INTENT_SCHEME)));
        PendingIntent launchAppPendingIntent1 = PendingIntent.getBroadcast(context, 0, intent1, PendingIntent.FLAG_UPDATE_CURRENT);
        remoteViews.setOnClickPendingIntent(R.id.nav_Icon, launchAppPendingIntent1);
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.nav_Icon);

        //



         if(headerbackground!=null&&!headerbackground.equals("")) {

           try {
               int colorid = Color.parseColor(headerbackground);
               remoteViews.setInt(R.id.widgetheader, "setBackgroundColor", colorid);
           }
           catch (Exception e)
           {
               e.printStackTrace();
           }
          }

         if(widgetbackground!=null&&!widgetbackground.equals("")) {
            if(widgetbackground.length()==9)
            {
                String modifiedcode=widgetbackground.substring(1,7);
                String transperacy=widgetbackground.charAt(7)+""+widgetbackground.charAt(8)+"";
                widgetbackground="#"+transperacy+modifiedcode;
            }

            try {
             int colorid= Color.parseColor(widgetbackground);
             remoteViews.setInt(R.id.widgetbackground, "setBackgroundColor", colorid);
            }
            catch (Exception e)
            {
                e.printStackTrace();;
            }
      }


     //Backgroundpicture="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAABxLuKEAAAACXBIWXMAABcSAAAXEgFnn9JSAAAKW2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNy0xMS0yMlQxODozNToyOS0wMjowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNy0xMS0yM1QyMjoxNTo1NS0wMjowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTctMTEtMjNUMjI6MTU6NTUtMDI6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmY5NTY2YTRiLTUwZWItM2U0MC05OWU3LTVhMWI1YWE0N2U0NiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhjMDBiNTgxLWMyZDUtM2U0Mi04YjRlLWVkYTYzMzVkMzE2NiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjA1NjE3OThlLWI2MTMtMjc0OC05MzZmLWM0MmUyYTU2ZjI1ZiIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgdGlmZjpPcmllbnRhdGlvbj0iMSIgdGlmZjpYUmVzb2x1dGlvbj0iMTUwMDAwMC8xMDAwMCIgdGlmZjpZUmVzb2x1dGlvbj0iMTUwMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSI2NTUzNSIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjcwIiBleGlmOlBpeGVsWURpbWVuc2lvbj0iNzAiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjA1NjE3OThlLWI2MTMtMjc0OC05MzZmLWM0MmUyYTU2ZjI1ZiIgc3RFdnQ6d2hlbj0iMjAxNy0xMS0yMlQxODozNToyOS0wMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MjI2Nzc2ZDQtYzYyMi0yYTQ3LTlkOWItZjY1NjZmODE3ODkzIiBzdEV2dDp3aGVuPSIyMDE3LTExLTIyVDIwOjE5OjMxLTAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiYWIwMDUzOC1kMGRkLWQzNDktOTE5MS1jNjBkOTVkNzE0YWYiIHN0RXZ0OndoZW49IjIwMTctMTEtMjNUMjI6MTU6NTUtMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmY5NTY2YTRiLTUwZWItM2U0MC05OWU3LTVhMWI1YWE0N2U0NiIgc3RFdnQ6d2hlbj0iMjAxNy0xMS0yM1QyMjoxNTo1NS0wMjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YmFiMDA1MzgtZDBkZC1kMzQ5LTkxOTEtYzYwZDk1ZDcxNGFmIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjA1NjE3OThlLWI2MTMtMjc0OC05MzZmLWM0MmUyYTU2ZjI1ZiIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjA1NjE3OThlLWI2MTMtMjc0OC05MzZmLWM0MmUyYTU2ZjI1ZiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsC+Yl8AAAS8SURBVHja7ZxraBRXFIB3FRWNhphI0ihqHpqCpRSFQiv2V3+Jsb5K6lujpjEBFW3qGtQ01Af4W6H4RzAaoQoKBR/U+IrPEOojaktFG426IZhkZzJJdt2dzfGcO7MZNzNqcGe2szt34GOXZfbOzrf3zj1z77nj6irNcxmQhVQgfyLPEB8iqK+JTOQcWpA6ZCuSbeTASMoOpBsBh9CLVH9IzFkHCRkI1SC3kZjzDpYS4cpAMVu5lH5+iYhJ5TJ0ZJCYn7gIHdtJzGUuQscNEuPlInR4XWrQw2VE00liOi09yI+5SE4M5BpjrZgOEtNhesHlBSCuGAfCXBcI85D56uvH8N07wLLFlePYsSwQ026+mPJPQVgwFLrWTQT/kUoIXqqBYP2xAdRC8PLRQfEav6+j7hD4azx4jEl4rCFWyDFZTNlUEBYOA2nzDAi3/QdWb+G2ZpAqvlT+iLIC+4oRi7NBXJwKfa9aIF5bn88L4tI0EFd/Yl8xdE3o3V8M8d56fytl1x37ipnjAn/tzriLCRzfxY5tXzHYU/hrtsVdjP/YThAK7S7msCf6VwcDEO54ideCVlOgsqjMKDG1OxJPjPzwKl6QRyvBWtmU2CjNBaFoFITuXUgCMU0XWftnPQcGfTGxbCz4ZrsgdPtcMtSYehCLRrJgLOZjlEwG4fsRWGPquBguhovhYriYjxazPh+ZAuKSVLYPA98rn+c7WAwNOJXkQHflLOiu+lah8httgMqxYtZMAHF5OsjPHmhDCd5HeKecxe7UnS0Ggzb55b/aMEJbM4rJ5GJYjWm+q9WY53/zGsPFcDFcDBdjmpgSZQKNBXOLxygsGsZOSH7cqIl52gTCAjcIC4dq+1HQR9+n8ZhkEyOuzgZp42fQs28RSNtmguT5GqQtM0DaMA3klodRcYy0+QtkurKPZ6bynU2fs1qUfGJWZbGYJdT4hxqwhNGCrAB9b0+IaJ/TPriF7pzDJpeBZWQmZ1MSl6WDUJQC8j/XBj3QLT9qUJoTSk3KpsQuvjSn/cNoNgcU+uvMB6WE7p1nc1Vi0Sg29ZvcvVJETiGN3Z59t5SmC0xgvxRHdNckB5sH7W9Uc+jElZqSoklxTBwT1axOa1LuUvNxR9cUxwV4ETlYO+giKz+5zdI6DKU4bmiT5GCPI64Zrw5DpBlLceSYb9lUlsZBtwL0no/58sFwLoaLGbSY+5eUDMvl6exeJyZWZIBvjovdOyW+mAdX2PBCV/F4pdbEAvZalIhIsU7Ci4HXvRBufcwyLE0By+oL9CSgGJ5qZiCm8P9JTvT//qvNkxMpnfXA2vinsx4sZ7XVvgnQFL0uTWNJhHFLgJbalTQ07LXsnTKPvYb081cQ7vRaL0VoA6lyFgjzTV9PYMUiiwL8oW6WxhHAth+8fgKCt04hJ03iFCszcGK3dizbL7J4+44ZAzq2LEedCqHhBFNgZbmVoJHGgZmUfEvEWLyQK0eZEzITKjMOC7n40j89PhLTykUYLxat5yJ03CQxHi5CRzWJGctF6MiMPPSiisvoZ+/Ax6Rc5VLyGoyeHzPE4c95uI4Mf9+jmPYgIQcJCSP7BvOMKmKyet2hrvy5GgR2JQl0Li+Qa+qzqfKMHLwB/D7/D1Y6wT4AAAAASUVORK5CYII=";

     if(Backgroundpicture!=null&&!Backgroundpicture.equals("")&&widgetModel.fileid!=null) {




            //File imgFile = new File(context.getFilesDir()+"/cachedimages/"+widget_id+".jpg")
           File imgFile = new File(context.getFilesDir()+"/cachedimages/"+widgetModel.fileid+".jpg");

           if(imgFile.exists()) {
             /* Commented for resize the bg image using 'option'
              Bitmap myBitmap = BitmapFactory.decodeFile(imgFile.getAbsolutePath());
              // Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
               remoteViews.setImageViewBitmap(R.id.widgetbgimg, myBitmap);*/
             //resize the image to less than requested Width height(400,500)
              remoteViews.setImageViewBitmap(R.id.widgetbgimg,
                       decodeSampledBitmapFromResource(imgFile.getAbsolutePath(),context, 400, 500));

           }
           else
           {
               remoteViews.setImageViewBitmap(R.id.widgetbgimg, null);

           }
        }






        Intent intent = homescreenwidgetservice.getIntent(context, appWidgetId);



       if(widgetModel.widgettype!=null&&widgetModel.widgettype.equals("2")) {
           remoteViews.setViewVisibility(R.id.widgetGrid, View.VISIBLE);
           remoteViews.setRemoteAdapter(R.id.widgetGrid, intent);
           Intent launchAppIntent = new Intent(context, homescreewidget.class);
           launchAppIntent.setAction(ACTION_LAUNCH);
           launchAppIntent.setData(Uri.parse(launchAppIntent.toUri(Intent.URI_INTENT_SCHEME)));
           PendingIntent launchAppPendingIntent = PendingIntent.getBroadcast(context, 0, launchAppIntent, PendingIntent.FLAG_UPDATE_CURRENT);
           remoteViews.setPendingIntentTemplate(R.id.widgetGrid, launchAppPendingIntent);

           appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widgetGrid);
       }
       else
       {
           remoteViews.setViewVisibility(R.id.widgetGrid_normal, View.VISIBLE);
           remoteViews.setRemoteAdapter(R.id.widgetGrid_normal, intent);
           Intent launchAppIntent = new Intent(context, homescreewidget.class);
           launchAppIntent.setAction(ACTION_LAUNCH);
           launchAppIntent.setData(Uri.parse(launchAppIntent.toUri(Intent.URI_INTENT_SCHEME)));
           PendingIntent launchAppPendingIntent = PendingIntent.getBroadcast(context, 0, launchAppIntent, PendingIntent.FLAG_UPDATE_CURRENT);
           remoteViews.setPendingIntentTemplate(R.id.widgetGrid_normal, launchAppPendingIntent);
           appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widgetGrid_normal);
       }

        // Tell the widget manager
        appWidgetManager.updateAppWidget(appWidgetId, remoteViews);
    }
 public static int calculateInSampleSize(
            BitmapFactory.Options options, int reqWidth, int reqHeight) {
        // Raw height and width of image
        final int height = options.outHeight;
        final int width = options.outWidth;
        int inSampleSize = 1;

        if (height > reqHeight || width > reqWidth) {

            final int halfHeight = height / 2;
            final int halfWidth = width / 2;

            // Calculate the largest inSampleSize value that is a power of 2 and keeps both
            // height and width larger than the requested height and width.
            while ((halfHeight / inSampleSize) >= reqHeight
                    && (halfWidth / inSampleSize) >= reqWidth) {
                inSampleSize *= 2;
            }
        }

        return inSampleSize;
    }


    public static Bitmap decodeSampledBitmapFromResource(String res,Context context,
                                                         int reqWidth, int reqHeight) {

        // First decode with inJustDecodeBounds=true to check dimensions
        final BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(res, options);

        // Calculate inSampleSize
        options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight);
      //  Toast.makeText(context,  "inSampleSize=>"+calculateInSampleSize(options, reqWidth, reqHeight), Toast.LENGTH_SHORT).show();

        // Decode bitmap with inSampleSize set
        options.inJustDecodeBounds = false;
        return BitmapFactory.decodeFile(res,options);
    }

        //get the orginal wodget uuid from generated widget id
        static String loadWidgetUuid(Context ctx, int id) {

        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, ctx.MODE_PRIVATE);
        String widgetid=prefs.getString(id+"","0");
        return widgetid;
    }


    static widget loadWidget(Context context, String widgetId) {

      Databasehelper db =new Databasehelper(context,DATABASE_NAME);
      widget wid=db.getwidget_forid(widgetId);
      db.close();
      return  wid;
    }




    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        switch (intent.getAction()) {
            case AppWidgetManager.ACTION_APPWIDGET_UPDATE:
                int widgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
                updateAppWidget(context, AppWidgetManager.getInstance(context), widgetId, "");
                break;
            case ACTION_FULLSCREEN:
                String widgetID_temp = intent.getStringExtra("widgetID");
                     //Toast.makeText(context, "Click Test"+widgetID_temp, Toast.LENGTH_SHORT).show();
                Intent launchAppIntent1= context.getPackageManager() .getLaunchIntentForPackage( context.getPackageName() );
                launchAppIntent1.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                launchAppIntent1.putExtra("widgetID",widgetID_temp);
                launchAppIntent1.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                launchAppIntent1.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
                launchAppIntent1.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(launchAppIntent1);
                break;
            case ACTION_LAUNCH:
               // String appPackage = intent.getStringExtra(EXTRA_APP_PACKAGE);
               // Toast.makeText(context, appPackage, Toast.LENGTH_SHORT).show();

                try {
                    PackageManager packageManager = context.getPackageManager();
                    String appPackage = intent.getStringExtra(EXTRA_APP_PACKAGE);
                    Intent launchIntent = packageManager.getLaunchIntentForPackage(appPackage);
                    if(launchIntent != null) {
                        context.startActivity(launchIntent);
                    } else {
                        try {
                            context.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + appPackage)));
                        } catch (android.content.ActivityNotFoundException anfe) {
                            context.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + appPackage)));
                        }
                    }
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(context, "Could not launch application", Toast.LENGTH_SHORT).show();
                }
                break;
            default:
                Log.d(TAG, "Unrecognized action: " + intent.getAction());
        }


    }

        @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        final int N = appWidgetIds.length;
        for (int i=0; i<N; i++) {
            int appWidgetId = appWidgetIds[i];
            updateAppWidget(context, appWidgetManager, appWidgetId, "");
        }
        super.onUpdate(context, appWidgetManager, appWidgetIds);
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
       // for (int appWidgetId : appWidgetIds) {
       //    homescreewidgetConfigureActivity.deleteTitlePref(context, appWidgetId);
     //   }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}

