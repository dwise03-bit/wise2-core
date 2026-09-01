package com.wise2.atak.radio

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

class MainActivity : Activity() {
    override fun onCreate(state: Bundle?) { super.onCreate(state); setContentView(TextView(this).apply {
        text = "WISE² RADIO BRIDGE\n\nBuild ready. Pair the UV‑PRO, grant Bluetooth permissions, then install the ATAK plugin build.\n\nSDK: ATAK CIV 5.6 (add app/libs/atak-civ-5.6.0.aar)"
        textSize = 18f; setPadding(40, 60, 40, 40)
    }) }
}
