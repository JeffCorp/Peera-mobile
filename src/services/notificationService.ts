import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
}

class NotificationService {
  private expoPushToken: string | null = null;

  constructor() {
    this.setupNotifications();
  }

  /**
   * Setup notification handling and configuration
   */
  private async setupNotifications() {
    // Configure how notifications are displayed when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request permissions and get push token
    await this.requestPermissions();
    await this.registerForPushNotifications();
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<NotificationPermissions> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        return {
          granted: status === "granted",
          canAskAgain: status === "undetermined",
        };
      }

      return {
        granted: true,
        canAskAgain: true,
      };
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return {
        granted: false,
        canAskAgain: false,
      };
    }
  }

  /**
   * Register for push notifications and get Expo push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return null;
      }

      const { granted } = await this.requestPermissions();
      if (!granted) {
        console.log("Notification permissions not granted");
        return null;
      }

      // Get the token that uniquely identifies this device
      // Only try to get push token if we have a valid project ID
      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
      if (
        !projectId ||
        projectId === "your-project-id" ||
        projectId.length < 10
      ) {
        console.log(
          "No valid project ID found. Local notifications will still work."
        );
        this.expoPushToken = null;
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      this.expoPushToken = token.data;
      console.log("Expo push token:", this.expoPushToken);

      // Configure Android channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#6366F1",
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  }

  /**
   * Send local notification immediately
   */
  async sendLocalNotification(
    notification: NotificationData
  ): Promise<string | null> {
    try {
      const { granted } = await this.requestPermissions();
      if (!granted) {
        console.log("Notification permissions not granted");
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: "default",
        },
        trigger: null, // Send immediately
      });

      console.log("Local notification sent:", notificationId);
      return notificationId;
    } catch (error) {
      console.error("Error sending local notification:", error);
      return null;
    }
  }

  /**
   * Schedule reminder notification
   */
  async scheduleReminder(
    title: string,
    body: string,
    date: Date,
    data?: any
  ): Promise<string | null> {
    try {
      const { granted } = await this.requestPermissions();
      if (!granted) {
        console.log("Notification permissions not granted");
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: date,
        },
      });

      console.log("Notification scheduled:", notificationId);
      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log("Notification cancelled:", notificationId);
    } catch (error) {
      console.error("Error cancelling notification:", error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling all notifications:", error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  /**
   * Handle notification tap/interaction
   */
  addNotificationResponseListener(listener: any) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Handle notification received while app is in foreground
   */
  addNotificationReceivedListener(listener: any) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule event reminder notifications
   */
  async scheduleEventReminder(
    eventTitle: string,
    eventDate: Date,
    reminderMinutes: number = 15
  ): Promise<string[]> {
    const notifications: string[] = [];

    try {
      // Schedule reminder notification
      const reminderDate = new Date(
        eventDate.getTime() - reminderMinutes * 60 * 1000
      );

      if (reminderDate > new Date()) {
        const reminderId = await this.scheduleReminder(
          `Upcoming Event: ${eventTitle}`,
          `Your event "${eventTitle}" starts in ${reminderMinutes} minutes`,
          reminderDate,
          {
            type: "event_reminder",
            eventTitle,
            eventDate: eventDate.toISOString(),
          }
        );

        if (reminderId) {
          notifications.push(reminderId);
        }
      }

      return notifications;
    } catch (error) {
      console.error("Error scheduling event reminder:", error);
      return [];
    }
  }

  /**
   * Test notification (for development)
   */
  async sendTestNotification(): Promise<void> {
    await this.sendLocalNotification({
      title: "Test Notification",
      body: "Push notifications are working!",
      data: { test: true },
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
