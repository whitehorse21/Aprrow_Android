package com.aprrow.widget;

import android.graphics.Bitmap;

/**
 * Created by DhisigmaLP001 on 18-02-2018.
 */

public class Application {
    public String appname;
    public String packagename;
    public Bitmap icon;
    public String fontcolor;


    public Application(String appname,String packagename,Bitmap icon,String fontcolor )
    {
        this.appname=appname;
        this.packagename=packagename;
        this.icon=icon;
        this.fontcolor=fontcolor;
    }

}
