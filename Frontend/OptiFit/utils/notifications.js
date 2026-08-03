import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from "../services/api";

// ─────────────────────────────────────────
// NOTIFICATION HANDLER
// ─────────────────────────────────────────
Notifications.setNotificationHandler({
handleNotification: async () => ({
shouldShowBanner: true,
shouldShowList: true,
shouldPlaySound: true,
shouldSetBadge: false,
}),
});

// ─────────────────────────────────────────
// ANDROID CHANNEL
// ─────────────────────────────────────────
async function setupAndroidChannel() {
if (Platform.OS === "android") {
await Notifications.setNotificationChannelAsync("water-reminders", {
name: "Water Reminders",
importance: Notifications.AndroidImportance.HIGH,
sound: "default",
vibrationPattern: [0, 250, 250, 250],
lightColor: "#38bdf8",
});
}
}

// ─────────────────────────────────────────
// REGISTER PERMISSIONS
// ─────────────────────────────────────────
export async function registerForNotifications() {
await setupAndroidChannel();

const { status: existingStatus } =
await Notifications.getPermissionsAsync();

let finalStatus = existingStatus;

if (existingStatus !== "granted") {
const { status } = await Notifications.requestPermissionsAsync();
finalStatus = status;
}

if (finalStatus !== "granted") {
console.log("❌ Notification permission not granted");
return false;
}

await Notifications.setNotificationCategoryAsync("water-actions", [
{
identifier: "DONE",
buttonTitle: "Done",
},
{
identifier: "SKIP",
buttonTitle: "Skip",
},
]);

return true;
}

// ─────────────────────────────────────────
// PREVENT MULTIPLE SCHEDULING
// ─────────────────────────────────────────
let isScheduling = false;

// ─────────────────────────────────────────
// SCHEDULE WATER REMINDERS (PRODUCTION)
// ─────────────────────────────────────────
export async function scheduleWaterReminder(minutes) {
if (isScheduling) return;
isScheduling = true;

try {
// Clear old notifications
await Notifications.cancelAllScheduledNotificationsAsync();
console.log("🧹 Old notifications cleared");


// Full day scheduling
const totalReminders = Math.floor(1440 / minutes);

for (let i = 1; i <= totalReminders; i++) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Drink Water",
      body: "Stay hydrated! Tap Done when you drink.",
      categoryIdentifier: "water-actions",
      ...(Platform.OS === "android" && {
        channelId: "water-reminders",
      }),
    },
    trigger: {
      type: "timeInterval",
      seconds: minutes * 60 * i, // ✅ real timing
      repeats: false,
    },
  });
}

console.log(
  `✅ Scheduled ${totalReminders} reminders every ${minutes} min`
);


} catch (err) {
console.log("❌ Schedule error:", err);
} finally {
isScheduling = false;
}
}

// ─────────────────────────────────────────
// NOTIFICATION LISTENER (DONE / SKIP)
// ─────────────────────────────────────────
let isProcessingDone = false;

export function setupNotificationListener(onWaterAdded) {
const subscription =
Notifications.addNotificationResponseReceivedListener(
async (response) => {
const action = response.actionIdentifier;
const notificationId = response.notification.request.identifier;


    try {
      // DONE
      if (action === "DONE") {
        if (isProcessingDone) return;
        isProcessingDone = true;

        await Notifications.dismissNotificationAsync(notificationId);

        const res = await api.post("/water/add", { amount: 100 });

        onWaterAdded({
          totalWater: res.data.totalWater,
          logs: res.data.logs,
        });

        setTimeout(() => {
          isProcessingDone = false;
        }, 1500);
      }

      // SKIP
      if (action === "SKIP") {
        await Notifications.dismissNotificationAsync(notificationId);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💧 Reminder (Snoozed)",
            body: "Time to drink water!",
            categoryIdentifier: "water-actions",
            ...(Platform.OS === "android" && {
              channelId: "water-reminders",
            }),
          },
          trigger: {
            type: "timeInterval",
            seconds: 60 * 60, // 1 hour snooze
            repeats: false,
          },
        });
      }
    } catch (err) {
      console.log("❌ Notification action error:", err.message);
      isProcessingDone = false;
    }
  }
);

return subscription;
}