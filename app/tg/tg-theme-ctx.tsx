"use client";

import { createContext, useContext } from "react";

interface TgThemeCtxType {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
}

export const TgThemeCtx = createContext<TgThemeCtxType>({
  isDark: true,
  setIsDark: () => {},
});

export const useTgTheme = () => useContext(TgThemeCtx);
