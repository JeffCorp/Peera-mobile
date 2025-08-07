import { useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { notificationService } from "../services/notificationService";

export const useNotifications = () => {
  useEffect(() => {
    let notificationListener: any;
    let responseListener: any;

    const setupNotifications = async () => {
      try {
        // Request permissions
        const permissions = await notificationService.requestPermissions();

        if (permissions.granted) {
          console.log("Notification permissions granted");

          // Get push token
          const token =
            await notificationService.registerForPushNotifications();
          console.log("Push token:", token);
        } else {
          console.log("Notification permissions denied");
          if (permissions.canAskAgain) {
            Alert.alert(
              "Notifications Disabled",
              "Enable notifications in settings to receive reminders and updates.",
              [{ text: "OK" }]
            );
          }
        }

        // Handle notifications received while app is in foreground
        notificationListener =
          notificationService.addNotificationReceivedListener(
            (notification: any) => {
              console.log("Notification received in foreground:", notification);
              // Optionally show custom in-app notification UI
            }
          );

        // Handle notification tap
        responseListener = notificationService.addNotificationResponseListener(
          (response: any) => {
            console.log("Notification tapped:", response);
            const data = response.notification.request.content.data;

            // Handle different notification types
            if (data?.type === "event_reminder") {
              // Navigate to calendar or show event details
              console.log("Event reminder tapped:", data);
            } else if (data?.type === "expense_reminder") {
              // Navigate to expenses screen
              console.log("Expense reminder tapped:", data);
            }
          }
        );
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();

    // Cleanup
    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  const sendTestNotification = useCallback(async () => {
    try {
      await notificationService.sendTestNotification();
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Error", "Failed to send test notification");
    }
  }, []);

  const scheduleEventReminder = useCallback(
    async (
      eventTitle: string,
      eventDate: Date,
      reminderMinutes: number = 15
    ) => {
      try {
        const notificationIds = await notificationService.scheduleEventReminder(
          eventTitle,
          eventDate,
          reminderMinutes
        );
        console.log("Event reminder scheduled:", notificationIds);
        return notificationIds;
      } catch (error) {
        console.error("Error scheduling event reminder:", error);
        return [];
      }
    },
    []
  );

  const sendLocalNotification = useCallback(
    async (title: string, body: string, data?: any) => {
      try {
        const notificationId = await notificationService.sendLocalNotification({
          title,
          body,
          data,
        });
        return notificationId;
      } catch (error) {
        console.error("Error sending local notification:", error);
        return null;
      }
    },
    []
  );

  return {
    sendTestNotification,
    scheduleEventReminder,
    sendLocalNotification,
    notificationService,
  };
};

export default useNotifications;
