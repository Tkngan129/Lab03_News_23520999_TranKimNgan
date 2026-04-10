import React, { createContext, useState, useContext } from 'react';
import { Appearance } from 'react-native';

export const ThemeContext = createContext();

export const lightTheme = {
  background: '#FFF0F5',
  card: '#FFFFFF',
  text: '#222222',
  accent: '#F891BB',
};

export const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#EEEEEE',
  accent: '#F891BB',
};

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  const toggleTheme = () => setIsDark(!isDark);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);