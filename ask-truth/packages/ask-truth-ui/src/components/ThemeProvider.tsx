import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, ThemeName } from '../types/theme';
import { getTheme, themeToCSSProperties } from '../utils/theme';

interface ThemeContextValue {
    theme: Theme;
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    defaultTheme = 'classic',
}) => {
    const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
    const [theme, setTheme] = useState<Theme>(() => getTheme(defaultTheme));

    const handleThemeChange = (name: ThemeName) => {
        setThemeName(name);
        setTheme(getTheme(name));
    };

    // Apply CSS custom properties to the document root
    useEffect(() => {
        const root = document.documentElement;
        const cssProperties = themeToCSSProperties(theme);

        Object.entries(cssProperties).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Cleanup function to remove properties
        return () => {
            Object.keys(cssProperties).forEach((property) => {
                root.style.removeProperty(property);
            });
        };
    }, [theme]);

    const value: ThemeContextValue = {
        theme,
        themeName,
        setTheme: handleThemeChange,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 