import * as Notifications from "expo-notifications";

// when added task, schedule notification
export const scheduleNotification = async (date, message, parentID, taskID) => {
    try {
        if (!date || isNaN(date.getTime())) {
            console.log("Invalid notification date: ", date);
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔔 Task Reminder",
                body: message,
                sound: "notification.wav",
                data: { parentID }
            },
            trigger: { type: "date", timestamp: date },
            identifier: taskID
        });
    } catch (error) {
        console.log("Error setting notification: ", error);
    }
};


export const removeNotification = async (taskID) => {
    await Notifications.cancelScheduledNotificationAsync(taskID);
};

// remove all notifications from a task (repeated tasks and main)
export const removeRepeatNotifications = async (parentID) => {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allNotifications) {
        if (notification.content?.data?.parentID === parentID) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
    }
}
