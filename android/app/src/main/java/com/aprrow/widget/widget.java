package com.aprrow.widget;

import java.util.List;

/**
 * Created by DhisigmaLP001 on 18-02-2018.
 */

public class widget {

    public String widgetname;
    public  String widgetid;
    public String headerbackground;
    public String widgetbackground;
    public String transperancy;
    public String backgroundpicture;
    public String widgettype="0";
    public String fileid="";
    public  List<Application> applist;

    public widget(String widgetid,String widgetname,String headerbackground,String widgetbackground,String transperancy,String Backgroundpicture, String fileid,List<Application>applist) {
        this.widgetid = widgetid;
        this.widgetname = widgetname;
        this.widgetbackground = widgetbackground;
        this.headerbackground = headerbackground;
        this.transperancy = transperancy;
        this.backgroundpicture=Backgroundpicture;
        this.fileid=fileid;
        this.applist = applist;

    }


}
