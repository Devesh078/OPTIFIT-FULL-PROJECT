import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STEP_TASK_NAME = "BACKGROUND_STEP_TASK";

const getTodayKey = () => new Date().toISOString().split("T")[0];

const saveTodaySteps = async (steps) => {
    await AsyncStorage.setItem(`steps-${getTodayKey()}`, String(steps));
};

const sendStepsToBackend = async (steps) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        await fetch("http://192.168.1.38:5000/api/steps/log", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ steps }),
        });
    } catch (e) {
        console.log("Background sync failed:", e);
    }
};

// ✅ FIXED: removed Pedometer.getStepCountAsync (not supported on Android)
// Instead reads last saved steps and syncs to backend
TaskManager.defineTask(STEP_TASK_NAME, async () => {
    try {
        const savedSteps = await AsyncStorage.getItem(`steps-${getTodayKey()}`);
        const steps = savedSteps ? Number(savedSteps) : 0;

        if (steps > 0) {
            await sendStepsToBackend(steps);
            return BackgroundTask.BackgroundTaskResult.Success;
        }

        return BackgroundTask.BackgroundTaskResult.NoData;
    } catch (err) {
        console.log("Background task error:", err);
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
});

export const registerStepTask = async () => {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(STEP_TASK_NAME);
        if (!isRegistered) {
            await BackgroundTask.registerTaskAsync(STEP_TASK_NAME, {
                minimumInterval: 60 * 15,
            });
            console.log("Background step task registered");
        }
    } catch (err) {
        console.log("Background task registration failed:", err);
    }
};

export const unregisterStepTask = async () => {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(STEP_TASK_NAME);
        if (isRegistered) {
            await BackgroundTask.unregisterTaskAsync(STEP_TASK_NAME);
        }
    } catch (err) {
        console.log("Unregister task error:", err);
    }
};