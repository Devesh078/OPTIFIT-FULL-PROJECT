package com.anonymous.optifitapp.dev

import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class StepCounterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "StepCounterModule"

    @ReactMethod
    fun startService(promise: Promise) {
        try {
            val intent = Intent(reactContext, StepCounterService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            promise.resolve("started")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopService(promise: Promise) {
        try {
            val intent = Intent(reactContext, StepCounterService::class.java)
            reactContext.stopService(intent)
            promise.resolve("stopped")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getSteps(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("steps_prefs", Context.MODE_PRIVATE)
            val today = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                .format(java.util.Date())
            val steps = prefs.getFloat("steps_$today", 0f)
            promise.resolve(steps.toInt())
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}