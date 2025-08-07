# Push Notifications Setup Guide

## 📦 Installation

```bash
npm install expo-notifications expo-device expo-constants
```

## 🔧 Configuration

### 1. Update `app.json`

Add this to your `expo` configuration:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#6366F1",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#6366F1"
    }
  }
}
```

### 2. Environment Variables

Create or update your `.env` file:

```bash
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

To get your project ID:

1. Run `npx expo whoami` to see your username
2. Your project ID is typically in format: `@username/project-name`
3. Or check your `app.json` under `expo.slug`

## 🚀 Features Implemented

### ✅ Local Notifications

- **Test Button**: CalendarScreen header (bell icon)
- **Event Confirmations**: When creating calendar events
- **Instant Feedback**: For user actions

### ✅ Scheduled Notifications

- **Event Reminders**: 15 minutes before calendar events
- **Custom Scheduling**: Any date/time notifications

### ✅ Push Notifications (when configured)

- **Remote Notifications**: Server-to-device messages
- **Background Delivery**: Works when app is closed
- **Custom Data**: Rich notification content

## 🧪 Testing

### Local Notifications (Works Now)

1. Open CalendarScreen
2. Tap the bell icon in header
3. Check notification appears

### Push Notifications (After Setup)

1. Complete configuration above
2. Test with the notification service
3. Use Expo's push tool: https://expo.dev/notifications

## 📱 Platform Requirements

### iOS

- Physical device required for push notifications
- Simulator supports local notifications only
- Automatic permission request on first use

### Android

- Works on emulator and device
- Notification channels configured automatically
- Custom notification icon recommended

## 🔔 Notification Types

### Event Reminders

```typescript
await scheduleEventReminder("Meeting", new Date(), 15);
```

### Local Notifications

```typescript
await sendLocalNotification("Title", "Body", { data: "value" });
```

### Custom Scheduling

```typescript
await notificationService.scheduleReminder(
  "Custom Reminder",
  "Remember to do something",
  new Date(Date.now() + 60000) // 1 minute from now
);
```

## 🛠️ Troubleshooting

### "Invalid UUID" Error

- Check your `EXPO_PUBLIC_PROJECT_ID` environment variable
- Ensure it matches your Expo project configuration
- Format should be a valid UUID or `@username/project-slug`

### Notifications Not Appearing

- Check device notification settings
- Ensure app has notification permissions
- Test on physical device (required for push notifications)

### Permission Issues

- iOS: Check Settings > Notifications > [Your App]
- Android: Check Settings > Apps > [Your App] > Notifications

## 📚 Additional Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notification Tool](https://expo.dev/notifications)
- [Testing Guide](https://docs.expo.dev/push-notifications/testing/)
