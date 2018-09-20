package com.aprrow.widget;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.ListView;
import android.widget.TextView;


import com.aprrow.Databasehelper;
import com.aprrow.R;


import java.util.ArrayList;
import java.util.List;

import static android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_ID;
import static android.appwidget.AppWidgetManager.INVALID_APPWIDGET_ID;
import static com.aprrow.widget.homescreewidget.DATABASE_NAME;
import static com.aprrow.widget.homescreewidget.PREFS_NAME;

/**
 * The configuration screen for the {@link homescreewidget homescreewidget} AppWidget.
 */
public class homescreewidgetConfigureActivity extends Activity {


    private SharedPreferences pref;
    ArrayList<String> widgets = new ArrayList<>();
    private List<widget> mWidgets = new ArrayList<>();
    private  Databasehelper db;


    public homescreewidgetConfigureActivity() {

        super();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.widget_config_activity);
        setResult(RESULT_CANCELED);
        pref = getApplicationContext().getSharedPreferences(PREFS_NAME,getApplicationContext().MODE_PRIVATE);
        db=new Databasehelper(getApplicationContext(),DATABASE_NAME  );;
        initListViews();
    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
        db.close();
    }

    public void initListViews() {

        loadWidgets();
        ListView widgetsList = (ListView) findViewById(R.id.config_widget_list);
        widgetsList.setAdapter(new BaseAdapter() {
            @Override
            public int getCount() {
                return mWidgets.size();
            }

            @Override
            public widget getItem(int position) {
                widget item=mWidgets.get(position);
                return item;
            }

            @Override
            public long getItemId(int position) {
                return 0;
            }

            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                ViewHolder holder;
                if(convertView == null) {
                    convertView = LayoutInflater.from(getApplicationContext()).inflate(android.R.layout.simple_list_item_1, parent, false);
                    holder = new ViewHolder(convertView);
                    convertView.setTag(holder);
                } else {
                    holder = (ViewHolder) convertView.getTag();
                }

                widget widget = getItem(position);
                holder.textView.setText(widget.widgetname);
                return convertView;
            }


        });

        widgetsList.setOnItemClickListener(new AdapterView.OnItemClickListener(){
            public void onItemClick(AdapterView<?> arg0, View v, int position, long arg3)  {
                widget widgetModel =mWidgets.get(position);
                showAppWidget(widgetModel);
            }
        });

    }


    private static class ViewHolder {
        private TextView textView;

        ViewHolder(View view) {
            if(view instanceof TextView) {
                textView = (TextView) view;
                textView.setTextColor(Color.parseColor("#000000"));
            }
        }
    }



    private void loadWidgets() {

        //get current device uuid  by hardware id
        //get list of widgets in current device id
        String android_id = Settings.Secure.getString(getApplicationContext().getContentResolver(),
                Settings.Secure.ANDROID_ID);
        String currentdevice_uuid = db.getcurrentdevice_uuid(android_id);
        List<widget> wdata = new ArrayList<>();
        wdata = db.getwidgetnames(currentdevice_uuid);
        mWidgets = wdata;
    }

    public void saveWidgetId(int id, widget selected)  {
        String id_widget=selected.widgetid;
       SharedPreferences.Editor editor = pref.edit();
       editor.putString(id+"",id_widget);
       editor.commit();
    }

    int mAppWidgetId;

    private void showAppWidget(widget selected) {
        mAppWidgetId = INVALID_APPWIDGET_ID;
        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            mAppWidgetId = extras.getInt(EXTRA_APPWIDGET_ID, INVALID_APPWIDGET_ID);

            saveWidgetId(mAppWidgetId, selected);

            Intent updateWidgetIntent = new Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE, null, this, homescreewidget.class);
            updateWidgetIntent.putExtra(EXTRA_APPWIDGET_ID, mAppWidgetId);
            sendBroadcast(updateWidgetIntent);

            Intent resultValue = new Intent();
            resultValue.putExtra(EXTRA_APPWIDGET_ID, mAppWidgetId);
            setResult(RESULT_OK, resultValue);
            finish();
        }
        if (mAppWidgetId == INVALID_APPWIDGET_ID) {
            Log.i("I am invalid", "I am invalid");
            finish();
        }

    }





}

