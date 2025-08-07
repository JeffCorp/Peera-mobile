import { Alert } from "react-native";

export interface CameraResult {
  uri: string;
  width: number;
  height: number;
  type: "image" | "video";
}

export interface CameraOptions {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: "photo" | "video" | "all";
  maxWidth?: number;
  maxHeight?: number;
}

class CameraService {
  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // In a real app, you would use expo-camera or react-native-image-picker
      // For now, we'll simulate permission request
      return new Promise((resolve) => {
        Alert.alert(
          "Camera Permission",
          "This app needs access to your camera to capture receipts.",
          [
            { text: "Deny", onPress: () => resolve(false), style: "cancel" },
            { text: "Allow", onPress: () => resolve(true) },
          ]
        );
      });
    } catch (error) {
      console.error("Failed to request camera permissions:", error);
      return false;
    }
  }

  /**
   * Check camera permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      // In a real app, check actual permissions
      // For now, return true to simulate granted permissions
      return true;
    } catch (error) {
      console.error("Failed to check camera permissions:", error);
      return false;
    }
  }

  /**
   * Take a photo
   */
  async takePhoto(options: CameraOptions = {}): Promise<CameraResult | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error("Camera permission denied");
        }
      }

      // In a real app, you would use expo-camera or react-native-image-picker
      // For now, we'll simulate taking a photo
      return new Promise((resolve) => {
        Alert.alert(
          "Camera Simulation",
          "This is a simulation. In a real app, the camera would open here.",
          [
            { text: "Cancel", onPress: () => resolve(null), style: "cancel" },
            {
              text: "Simulate Photo",
              onPress: () => {
                // Return a mock photo result
                resolve({
                  uri: "file://mock-receipt-photo.jpg",
                  width: 1920,
                  height: 1080,
                  type: "image",
                });
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error("Failed to take photo:", error);
      Alert.alert("Error", "Failed to capture photo. Please try again.");
      return null;
    }
  }

  /**
   * Pick image from gallery
   */
  async pickImage(options: CameraOptions = {}): Promise<CameraResult | null> {
    try {
      // In a real app, you would use expo-image-picker
      // For now, we'll simulate picking an image
      return new Promise((resolve) => {
        Alert.alert(
          "Gallery Simulation",
          "This is a simulation. In a real app, the gallery would open here.",
          [
            { text: "Cancel", onPress: () => resolve(null), style: "cancel" },
            {
              text: "Simulate Pick",
              onPress: () => {
                // Return a mock image result
                resolve({
                  uri: "file://mock-receipt-gallery.jpg",
                  width: 1920,
                  height: 1080,
                  type: "image",
                });
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error("Failed to pick image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      return null;
    }
  }

  /**
   * Show camera options (take photo or pick from gallery)
   */
  async showCameraOptions(): Promise<CameraResult | null> {
    return new Promise((resolve) => {
      Alert.alert("Receipt Capture", "Choose how you want to add a receipt", [
        { text: "Cancel", onPress: () => resolve(null), style: "cancel" },
        { text: "Take Photo", onPress: () => this.takePhoto().then(resolve) },
        {
          text: "Choose from Gallery",
          onPress: () => this.pickImage().then(resolve),
        },
      ]);
    });
  }

  /**
   * Compress image
   */
  async compressImage(
    uri: string,
    options: { quality?: number; maxWidth?: number; maxHeight?: number } = {}
  ): Promise<string> {
    try {
      // In a real app, you would use expo-image-manipulator or similar
      // For now, return the original URI
      return uri;
    } catch (error) {
      console.error("Failed to compress image:", error);
      return uri;
    }
  }

  /**
   * Get image info
   */
  async getImageInfo(
    uri: string
  ): Promise<{ width: number; height: number; size: number } | null> {
    try {
      // In a real app, you would get actual image info
      // For now, return mock data
      return {
        width: 1920,
        height: 1080,
        size: 1024 * 1024, // 1MB
      };
    } catch (error) {
      console.error("Failed to get image info:", error);
      return null;
    }
  }

  /**
   * Validate image
   */
  validateImage(uri: string): boolean {
    // Basic validation - check if URI exists and has valid format
    if (!uri || typeof uri !== "string") {
      return false;
    }

    // Check for common image extensions
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const hasValidExtension = validExtensions.some((ext) =>
      uri.toLowerCase().includes(ext)
    );

    return hasValidExtension;
  }

  /**
   * Get camera settings
   */
  getCameraSettings() {
    return {
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3] as [number, number],
      mediaTypes: "photo" as const,
      maxWidth: 1920,
      maxHeight: 1080,
    };
  }

  /**
   * Check if camera is available
   */
  async isCameraAvailable(): Promise<boolean> {
    try {
      // In a real app, check if camera hardware is available
      return true;
    } catch (error) {
      console.error("Failed to check camera availability:", error);
      return false;
    }
  }

  /**
   * Get supported image formats
   */
  getSupportedFormats(): string[] {
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  }

  /**
   * Get maximum image dimensions
   */
  getMaxDimensions(): { width: number; height: number } {
    return {
      width: 4096,
      height: 4096,
    };
  }

  /**
   * Get recommended image quality
   */
  getRecommendedQuality(): number {
    return 0.8; // 80% quality
  }

  /**
   * Get file size limit
   */
  getFileSizeLimit(): number {
    return 10 * 1024 * 1024; // 10MB
  }

  /**
   * Check if image meets requirements
   */
  async validateImageRequirements(
    uri: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if image exists
    if (!this.validateImage(uri)) {
      errors.push("Invalid image format");
    }

    // Check file size
    const imageInfo = await this.getImageInfo(uri);
    if (imageInfo && imageInfo.size > this.getFileSizeLimit()) {
      errors.push("Image file size too large");
    }

    // Check dimensions
    if (imageInfo) {
      const maxDims = this.getMaxDimensions();
      if (
        imageInfo.width > maxDims.width ||
        imageInfo.height > maxDims.height
      ) {
        errors.push("Image dimensions too large");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const cameraService = new CameraService();
export default cameraService;
