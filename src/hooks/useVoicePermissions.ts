import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { voiceService } from "../services/voiceService";

export interface VoicePermissions {
  microphone: boolean;
  loading: boolean;
  error: string | null;
}

export const useVoicePermissions = () => {
  const [permissions, setPermissions] = useState<VoicePermissions>({
    microphone: false,
    loading: true,
    error: null,
  });

  const checkPermissions = async () => {
    try {
      setPermissions((prev) => ({ ...prev, loading: true, error: null }));

      const hasPermission = await voiceService.checkPermissions();

      setPermissions({
        microphone: hasPermission,
        loading: false,
        error: null,
      });
    } catch (error) {
      setPermissions({
        microphone: false,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to check permissions",
      });
    }
  };

  const requestPermissions: () => Promise<boolean> = async () => {
    try {
      setPermissions((prev) => ({ ...prev, loading: true, error: null }));

      const granted = await voiceService.requestPermissions();

      if (granted) {
        setPermissions({
          microphone: true,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setPermissions({
          microphone: false,
          loading: false,
          error: "Microphone permission denied",
        });

        // Show alert to guide user to settings
        Alert.alert(
          "Microphone Permission Required",
          "To use voice features, please enable microphone access in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => {
                // In a real app, you might want to open device settings
                console.log("Should open device settings");
              },
            },
          ]
        );

        return false;
      }
    } catch (error) {
      setPermissions({
        microphone: false,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to request permissions",
      });
      return false;
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissions,
    checkPermissions,
    requestPermissions,
  };
};
