package com.cworklog.android;

import android.os.Bundle;
import org.apache.cordova.*;

public class CWorkLog extends DroidGap
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.loadUrl(Config.getStartUrl());
    }
}
