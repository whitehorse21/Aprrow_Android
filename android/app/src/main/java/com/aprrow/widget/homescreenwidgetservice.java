package com.aprrow.widget;

import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Bundle;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;


import com.aprrow.Databasehelper;
import com.aprrow.R;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;

import static com.aprrow.widget.homescreewidget.DATABASE_NAME;
import static com.aprrow.widget.homescreewidget.PREFS_NAME;


/**
 * Created by DhisigmaLP001 on 16-02-2018.
 */

public class homescreenwidgetservice extends RemoteViewsService {

    public static Intent getIntent(Context context, int baseProviderId) {
        Intent intent = new Intent(context, homescreenwidgetservice.class);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, baseProviderId);
        intent.setData(Uri.parse(intent.toUri(Intent.URI_INTENT_SCHEME)));
        return intent;
    }


    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        String packageName = getApplicationContext().getPackageName();
        int appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);


         List<Application> appModels = loadAppModels(getApplicationContext(), appWidgetId);

        return new FiveByFiveWidgetFactory(packageName, appModels, appWidgetId);
    }


  /*  private List<String> loadCheckedApps(Context ctx, int widgetId) {
        SessionSharedPreferences sessionSharedPreferences = new SessionSharedPreferences(ctx);
        DatabaseHelper dbHelper = new DatabaseHelper(ctx);

        String widgetUuid = sessionSharedPreferences.getHomeScreenWidget(widgetId);
        WidgetModel widgetModel = dbHelper.selectWidgetById(widgetUuid);

        dbHelper.close();

        return (widgetModel == null)? new ArrayList<>() : widgetModel.getAppList();
    }*/

    static String loadWidgetUuid(Context ctx, int id) {

        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, ctx.MODE_PRIVATE);
        String widgetid=prefs.getString(id+"","0");
        return widgetid;
    }

    private List<Application> loadAppModels(Context context, int appWidgetId) {

       Databasehelper db=new Databasehelper(getApplicationContext(),DATABASE_NAME  );
       String widgetuuid=loadWidgetUuid(context,appWidgetId);

        List<Application>apps=new ArrayList<>();
        List<Application>checkedapps=new ArrayList<>();
        String fontcolor="#FFFFFF";
        try {
            checkedapps = db.getappsforwidget(widgetuuid);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        db.close();
        PackageManager packageManager = context.getPackageManager();

        for(Application app : checkedapps) {

            String packageName=app.packagename;
            if(fontcolor!=null&&fontcolor.contains("#"))
            fontcolor=app.fontcolor;
            try {
                ApplicationInfo applicationInfo = packageManager.getApplicationInfo(packageName, PackageManager.GET_META_DATA);
                Resources resources = packageManager.getResourcesForApplication(applicationInfo);

                Drawable appIcon_temp = packageManager
                        .getApplicationIcon(applicationInfo);


                Bitmap appIcon = null;

                if (appIcon_temp instanceof BitmapDrawable) {
                    appIcon = ((BitmapDrawable) appIcon_temp).getBitmap();

                } else {
                    final Bitmap bmp = Bitmap.createBitmap(appIcon_temp.getIntrinsicWidth(), appIcon_temp.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
                    final Canvas canvas = new Canvas(bmp);
                    appIcon_temp.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                    appIcon_temp.draw(canvas);
                    appIcon = bmp;
                }

                String appName = packageManager.getApplicationLabel(applicationInfo).toString();

                if(appName!=null&&appName.length()>18)
                    appName=appName.substring(0,18);

                apps.add(new Application(appName, packageName, appIcon,fontcolor));
            } catch (PackageManager.NameNotFoundException e) {
                // Triggered when an app is not installed.
                // Uncomment the following line to create a placeholder space.
                Bitmap appIcon = BitmapFactory.decodeResource(context.getResources(),R.drawable.unavailableapp);
                Application app_temp=new Application(app.appname,app.packagename,appIcon,fontcolor);
               // app_temp.setnote_availble();
                apps.add(app_temp);
            }
        }

        return  apps;
    }

    private class FiveByFiveWidgetFactory implements RemoteViewsFactory {

        private String packageName;
        private String baseProviderId;
        private int widgetId;
        private List<Application>  apps;

        FiveByFiveWidgetFactory(String packageName, List<Application> apps, int appWidgetId) {
            this.packageName = packageName;
            this.baseProviderId = appWidgetId + "_apps";
            this.widgetId = appWidgetId;
            if(apps == null) {
                this.apps = new ArrayList<>();
            } else {
                this.apps = apps;
            }

        }

        @Override
        public void onCreate() {

        }

        @Override
        public void onDataSetChanged() {
            apps = loadAppModels(getApplicationContext(), widgetId);

        }

        @Override
        public void onDestroy() {

        }

        @Override
        public int getCount() {
            return apps.size();
        }

        @Override
        public RemoteViews getViewAt(int position) {
            Application app = apps.get(position);
            final RemoteViews remoteViews = new RemoteViews(packageName, R.layout.widget_standard_grid_item);
            remoteViews.setTextViewText(R.id.appLabel1,app.appname);

           int fontcolor= Color.parseColor("#000000");
           try{
               fontcolor= Color.parseColor(app.fontcolor);

           }
           catch (Exception e)
           {
             e.printStackTrace();
           }

            remoteViews.setTextColor(R.id.appLabel1,fontcolor);

            //if(!app.is_appavailable())
            //    remoteViews.setTextColor( R.id.appLabel1,getColor(R.color.grey_font));

           remoteViews.setImageViewBitmap(R.id.imageButton1, app.icon);

            Bundle extras = new Bundle();
            extras.putString(homescreewidget.EXTRA_APP_PACKAGE, app.packagename);
            Intent fillInIntent = new Intent();
            fillInIntent.putExtras(extras);
            remoteViews.setOnClickFillInIntent(R.id.imageButton1, fillInIntent);
            return remoteViews;
        }

        @Override
        public RemoteViews getLoadingView() {
            return null;
        }

        @Override
        public int getViewTypeCount() {
            return 1;
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public boolean hasStableIds() {
            return true;
        }
    }


}
