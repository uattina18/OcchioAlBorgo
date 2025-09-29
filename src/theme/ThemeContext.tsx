import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Theme = "light" | "dark";
type Colors = {
  bg: string;
  card: string;
  text: string;
  sub: string;
  hr: string;
  tint: string;
};

type Ctx = {
  theme: Theme;
  colors: Colors;
  setDark: (on: boolean) => void;
  toggleDark: () => void;
  topPad: number; // ✅ aggiunto qui
};

const ThemeContext = createContext<Ctx | null>(null);

const LIGHT: Colors = {
  bg: "#e8e9ea",
  card: "#ffffff",
  text: "#000000",
  sub: "#666666",
  hr: "#e6e6e6",
  tint: "#3a602a",
};
const DARK: Colors = {
  bg: "#111213",
  card: "#17191a",
  text: "#f2f2f2",
  sub: "#bdbdbd",
  hr: "#262829",
  tint: "#7bbf68",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 16) + 24; // ✅ padding dinamico

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("prefs");
        if (saved) {
          const p = JSON.parse(saved);
          if (p.dark === true) setTheme("dark");
        }
      } catch {}
    })();
  }, []);

  const setDark = async (on: boolean) => {
    setTheme(on ? "dark" : "light");
    try {
      const saved = await SecureStore.getItemAsync("prefs");
      let p: any = {};
      try {
        p = saved ? JSON.parse(saved) : {};
      } catch {}
      p.dark = on;
      await SecureStore.setItemAsync("prefs", JSON.stringify(p));
    } catch {}
  };

  const colors = useMemo<Colors>(
    () => (theme === "dark" ? DARK : LIGHT),
    [theme]
  );

  const value: Ctx = {
    theme,
    colors,
    setDark,
    toggleDark: () => setDark(theme !== "dark"),
    topPad, // ✅ incluso nel valore
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};

export const useColors = () => useTheme().colors;
export const useTopPad = () => useTheme().topPad; // ✅ export dedicato
