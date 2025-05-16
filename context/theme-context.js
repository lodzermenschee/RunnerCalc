import { createContext, useContext, useState } from 'react';

// Tworzymy kontekst tematyki
export const ThemeContext = createContext();

// Provider do zarządzania stanem tematu
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(prevIsDark => !prevIsDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pomocniczy do używania kontekstu w komponentach
export const useThemeContext = () => useContext(ThemeContext);
