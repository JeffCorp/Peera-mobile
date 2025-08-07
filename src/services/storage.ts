import { STORAGE_KEYS } from "@/constants";
import { safeJsonParse, safeJsonStringify } from "@/utils/helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";

class StorageService {
  // Generic storage methods
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      const jsonValue = safeJsonStringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error saving to storage:", error);
      throw new Error("Failed to save data to storage");
    }
  }

  async getItem<T>(key: string, fallback?: T): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        return safeJsonParse(jsonValue, fallback);
      }
      return fallback || null;
    } catch (error) {
      console.error("Error reading from storage:", error);
      return fallback || null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from storage:", error);
      throw new Error("Failed to remove data from storage");
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw new Error("Failed to clear storage");
    }
  }

  // Auth storage methods
  async setAuthToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.auth.token, token);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.auth.token);
  }

  async setRefreshToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.auth.refreshToken, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.auth.refreshToken);
  }

  async setUser(user: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.auth.user, user);
  }

  async getUser(): Promise<any | null> {
    return this.getItem(STORAGE_KEYS.auth.user);
  }

  async clearAuth(): Promise<void> {
    await Promise.all([
      this.removeItem(STORAGE_KEYS.auth.token),
      this.removeItem(STORAGE_KEYS.auth.refreshToken),
      this.removeItem(STORAGE_KEYS.auth.user),
    ]);
  }

  // App settings storage methods
  async setTheme(theme: "light" | "dark" | "system"): Promise<void> {
    return this.setItem(STORAGE_KEYS.app.theme, theme);
  }

  async getTheme(): Promise<"light" | "dark" | "system"> {
    return this.getItem<"light" | "dark" | "system">(
      STORAGE_KEYS.app.theme,
      "system"
    );
  }

  async setLanguage(language: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.app.language, language);
  }

  async getLanguage(): Promise<string> {
    return this.getItem<string>(STORAGE_KEYS.app.language, "en");
  }

  async setOnboardingComplete(complete: boolean): Promise<void> {
    return this.setItem(STORAGE_KEYS.app.onboarding, complete);
  }

  async getOnboardingComplete(): Promise<boolean> {
    return this.getItem<boolean>(STORAGE_KEYS.app.onboarding, false);
  }

  // Conversation storage methods
  async setConversations(conversations: any[]): Promise<void> {
    return this.setItem(STORAGE_KEYS.conversations.list, conversations);
  }

  async getConversations(): Promise<any[]> {
    return this.getItem<any[]>(STORAGE_KEYS.conversations.list, []);
  }

  async setCurrentConversation(conversation: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.conversations.current, conversation);
  }

  async getCurrentConversation(): Promise<any | null> {
    return this.getItem(STORAGE_KEYS.conversations.current);
  }

  // Utility methods
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  }

  async getMultiple(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error("Error getting multiple items:", error);
      return [];
    }
  }

  async setMultiple(keyValuePairs: [string, unknown][]): Promise<void> {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        safeJsonStringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error("Error setting multiple items:", error);
      throw new Error("Failed to save multiple items to storage");
    }
  }
}

export const storageService = new StorageService();
export default storageService;
