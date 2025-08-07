# Volume Troubleshooting Guide

## Issue: Low Volume in Text-to-Speech

If you're experiencing low volume with the text-to-speech functionality, here are several solutions to try:

## 🔧 Quick Fixes

### 1. **Check Device Volume**

- **iOS**: Use volume buttons or Control Center
- **Android**: Use volume buttons or Quick Settings
- **Ensure media volume is at maximum**

### 2. **Check Silent Mode**

- **iOS**: Make sure silent mode is off (switch on side of device)
- **Android**: Check Do Not Disturb settings
- **The app is configured to play in silent mode, but device volume still matters**

### 3. **Check App Permissions**

- **Microphone**: Required for voice input
- **Audio**: Should be granted automatically
- **Go to Settings > Privacy & Security > Microphone**

## 🎵 Audio Configuration Solutions

### **Enhanced Volume Methods**

The app now includes enhanced volume methods:

```typescript
// Use enhanced volume for better clarity
await voiceService.speakTextWithEnhancedVolume("Your message here");

// Use important message for maximum volume
await voiceService.speakImportantMessage("Important message here");
```

### **Audio Mode Configuration**

The app automatically configures audio for optimal TTS:

```typescript
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true, // Play even in silent mode
  staysActiveInBackground: false,
  shouldDuckAndroid: false, // Don't reduce volume
  playThroughEarpieceAndroid: false, // Use speaker, not earpiece
});
```

## 📱 Platform-Specific Solutions

### **iOS Solutions**

1. **Check Audio Output**

   - Go to Settings > Sounds & Haptics
   - Ensure "Change with Buttons" is enabled
   - Check "Ringer and Alerts" volume

2. **Check Accessibility Settings**

   - Go to Settings > Accessibility > Audio/Visual
   - Ensure "Mono Audio" is off
   - Check "Balance" is centered

3. **Check App Settings**
   - Go to Settings > [Your App Name]
   - Ensure microphone permission is granted

### **Android Solutions**

1. **Check Audio Output**

   - Go to Settings > Sound
   - Ensure "Media volume" is at maximum
   - Check "Do not disturb" settings

2. **Check App Permissions**

   - Go to Settings > Apps > [Your App Name] > Permissions
   - Ensure microphone permission is granted

3. **Check Audio Focus**
   - The app requests audio focus to prevent other apps from reducing volume

## 🎛️ Advanced Volume Controls

### **Custom Volume Settings**

You can customize the TTS settings for better volume:

```typescript
// Higher pitch and slower rate for better clarity
await voiceService.speakTextWithEnhancedVolume("Message", {
  pitch: 1.2, // Higher pitch (default: 1.1)
  rate: 0.6, // Slower rate (default: 0.7)
  language: "en-US",
});
```

### **Important Message Settings**

For critical messages, use maximum volume settings:

```typescript
// Maximum clarity and volume
await voiceService.speakImportantMessage("Critical message", {
  language: "en-US",
});
```

## 🔍 Troubleshooting Steps

### **Step 1: Test Basic TTS**

1. Open the app
2. Go to Home screen
3. Tap voice input
4. Say "Hello" or any simple command
5. Check if you hear the response

### **Step 2: Test Enhanced Volume**

1. If basic TTS is too quiet, the app automatically uses enhanced volume
2. Try saying: "Schedule a meeting"
3. You should hear a louder, clearer response

### **Step 3: Test Important Messages**

1. Try saying something that triggers an error
2. Error messages use maximum volume settings
3. You should hear a very clear error message

### **Step 4: Check Device Audio**

1. Play music or video on your device
2. Ensure volume is at a comfortable level
3. Return to the app and test voice commands

## 🚨 Common Issues and Solutions

### **Issue: No Audio at All**

**Solutions:**

- Check device volume
- Check silent mode
- Restart the app
- Check app permissions

### **Issue: Very Low Volume**

**Solutions:**

- Use enhanced volume methods (automatic)
- Check device media volume
- Check audio output settings
- Try important message method

### **Issue: Audio Cuts Out**

**Solutions:**

- Check battery optimization settings
- Ensure app stays in foreground
- Check background app refresh settings

### **Issue: Audio Quality Issues**

**Solutions:**

- Adjust pitch and rate settings
- Check device audio quality settings
- Ensure good internet connection (for AI processing)

## 📋 Volume Settings Reference

### **Default Settings**

```typescript
{
  language: 'en-US',
  pitch: 1.0,      // Normal pitch
  rate: 0.75       // Normal rate
}
```

### **Enhanced Volume Settings**

```typescript
{
  language: 'en-US',
  pitch: 1.1,      // Slightly higher for clarity
  rate: 0.7        // Slightly slower for understanding
}
```

### **Important Message Settings**

```typescript
{
  language: 'en-US',
  pitch: 1.2,      // Higher pitch for importance
  rate: 0.65       // Slower rate for clarity
}
```

## 🎯 Best Practices

### **For Better Volume:**

1. **Use enhanced volume methods** (automatic in the app)
2. **Keep device volume at 70% or higher**
3. **Use important message method for critical information**
4. **Test in a quiet environment first**

### **For Better Clarity:**

1. **Speak clearly when giving voice commands**
2. **Use shorter, simpler commands**
3. **Wait for the response before speaking again**
4. **Check transcription accuracy**

## 🔄 If Problems Persist

If you're still experiencing volume issues:

1. **Restart the app** completely
2. **Restart your device**
3. **Check for app updates**
4. **Test on a different device**
5. **Contact support** with specific details about your device and iOS/Android version

## 📞 Support Information

When reporting volume issues, please include:

- Device model and OS version
- App version
- Steps to reproduce the issue
- Current device volume settings
- Whether the issue occurs with other apps

The enhanced volume methods should resolve most volume issues. If problems persist, the issue may be device-specific or related to system settings.
