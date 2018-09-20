package com.aprrow;

import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.aprrow.widget.Application;
import com.aprrow.widget.widget;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by DhisigmaLP001 on 18-02-2018.
 */

public class Databasehelper extends SQLiteOpenHelper {


    // Path to the device folder with database
    public static String DB_PATH;

    // Database filename
    public static String DB_NAME;
    public SQLiteDatabase database;
    public final Context context;

    public SQLiteDatabase getDb() {
        return database;
    }

    public Databasehelper(Context context, String databaseName) {
        super(context, databaseName, null, 1);
        this.context = context;
        DB_NAME = databaseName;
        DB_PATH =context.getDatabasePath(DB_NAME).getPath() ;
        openDataBase();

    }
    public boolean checkDataBase(){
        SQLiteDatabase checkDb = null;
        try {

            checkDb = SQLiteDatabase.openDatabase(DB_PATH, null, SQLiteDatabase.OPEN_READONLY);
        } catch (SQLException e){
            Log.e(this.getClass().toString(), "Error while checking db");
        }

        if (checkDb != null){
            checkDb.close();
        }
        return checkDb !=null;
    }


    SQLiteDatabase openDataBase() throws SQLException {

        if (database == null) {
           // createDataBase();
            database = SQLiteDatabase.openDatabase(DB_PATH, null,
                    SQLiteDatabase.OPEN_READWRITE);
            //database = getWritableDatabase();
        }
        return database;
    }

    @Override
    public synchronized void close(){
        if (database != null){
            database.close();
        }
        super.close();
    }

    public List<widget> getwidgetnames(String deviceid)  {

        deviceid="'"+deviceid+"'";
        String query = "SELECT widgetname,widgetid FROM widget where deleteflag=0 AND deviceid ="+deviceid;
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);

        List<widget> widgets = new ArrayList<>();
        int widgetname_idx = cursor.getColumnIndex("widgetname");
        int widgetid_idx = cursor.getColumnIndex("widgetid");

        while (cursor.moveToNext()) {
            String widgetid = cursor.getString(widgetid_idx);
            String name = cursor.getString(widgetname_idx);
            widget wid=new widget(widgetid,name,"","","","","",null);
            widgets.add(wid);
        }
        cursor.close();

        return widgets;
    }

    //get widget id for current widgetid
    public widget getwidget_forid(String widgetid)  {

        widgetid="'"+widgetid+"'";
        String query = "SELECT * FROM widget where deleteflag=0 AND widgetid ="+widgetid;
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);

        List<widget> widgets = new ArrayList<>();
        int idx_name = cursor.getColumnIndex("widgetname");
        int idx_id = cursor.getColumnIndex("widgetid");
        int idx_header = cursor.getColumnIndex("headercolor");
        int idx_backgroundcolor = cursor.getColumnIndex("backgroundcolor");
        int idx_transperancy = cursor.getColumnIndex("transperancy");
        int idx_backgroundpicture = cursor.getColumnIndex("backgroundpicture");
        int idx_widgettype=cursor.getColumnIndex("mostusedwidget");
        int idx_fileid=cursor.getColumnIndex("fileid");
        widget wid=null;
        while (cursor.moveToNext()) {
            String id = cursor.getString(idx_id);
            String name=cursor.getString(idx_name);
            String headercolor = cursor.getString(idx_header);
            String transperancy=cursor.getString(idx_transperancy);
            String backgroundcolor=cursor.getString(idx_backgroundcolor);
            String backgroundpicture=cursor.getString(idx_backgroundpicture);
            String widgettype=cursor.getString(idx_widgettype);
            String fileid=cursor.getString(idx_fileid);
            wid=new widget(widgetid,name,headercolor,backgroundcolor,transperancy,backgroundpicture,fileid,null);
            wid.widgettype=widgettype;
            //widgets.add(wid);
        }
        cursor.close();

        return wid;
    }


    //get apps fpr widget
    public List<Application> getappsforwidget(String widgetid) throws JSONException {

        widgetid = "'" + widgetid + "'";
        String query = "SELECT applist,fontcolor FROM widget where deleteflag=0 AND widgetid =" + widgetid;
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);

        List<Application> apps = new ArrayList<>();
        int idx_applist = cursor.getColumnIndex("applist");
        int idx_fontcolor = cursor.getColumnIndex("fontcolor");


        widget wid = null;
        while (cursor.moveToNext()) {

            JSONArray applist = new JSONArray(cursor.getString(idx_applist));
            String fontcolor = cursor.getString(idx_fontcolor);


            for (int i = 0; i < applist.length(); i++) {
                JSONObject appobj = applist.getJSONObject(i);
                String appname = appobj.getString("appname");
                String packagename = appobj.getString("package");
                Application app = new Application(appname, packagename, null,fontcolor);
                apps.add(app);

            }

        }
        cursor.close();

        return apps;
    }



  public String getcurrentdevice_uuid(String Device_hardid)
  {

      Device_hardid="'"+Device_hardid+"'";
      String query="SELECT deviceid FROM device WHERE deleteflag=0 and device_hardid= "+Device_hardid;
      SQLiteDatabase db = getReadableDatabase();
      Cursor cursor = db.rawQuery(query, null);

      String device_uuid="";
      if(cursor.moveToNext())
      {
          device_uuid=cursor.getString(0);
      }

      return  device_uuid;
  }






    @Override
    public void onCreate(SQLiteDatabase db) {

    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {

    }
}
