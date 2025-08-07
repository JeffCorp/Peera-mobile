import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
  };
}

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  const theme: Theme = {
    colors: {
      primary: "#007AFF",
      background: isDark ? "#000000" : "#FFFFFF",
      text: isDark ? "#FFFFFF" : "#000000",
    },
  };

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        setThemeModeState("system");
      } catch (error) {
        console.error("Failed to load theme mode:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemeMode();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
