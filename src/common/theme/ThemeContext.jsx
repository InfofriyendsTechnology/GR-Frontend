import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEME_OPTIONS = [
    { label: 'Default Blue', value: 'theme-default', color: '#19a7ce' },
    { label: 'Ocean Blue', value: 'theme-ocean', color: '#0ea5e9' },
    { label: 'Royal Purple', value: 'theme-purple', color: '#8b5cf6' },
    { label: 'Emerald Green', value: 'theme-green', color: '#10b981' },
    { label: 'Sunset Orange', value: 'theme-orange', color: '#f97316' },
    { label: 'Ruby Red', value: 'theme-red', color: '#ef4444' },
    { label: 'Rose Pink', value: 'theme-pink', color: '#ec4899' },
    { label: 'Royal Indigo', value: 'theme-indigo', color: '#6366f1' },
    { label: 'Teal', value: 'theme-teal', color: '#14b8a6' },
    { label: 'Golden Amber', value: 'theme-amber', color: '#f59e0b' },
    { label: 'Sky Blue', value: 'theme-sky', color: '#0284c7' },
    { label: 'Lime Green', value: 'theme-lime', color: '#84cc16' }
];

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'theme-default';
    });

    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem('isDark') === 'true';
    });

    useEffect(() => {
        // Remove all theme classes
        document.body.classList.forEach(className => {
            if (className.startsWith('theme-')) {
                document.body.classList.remove(className);
            }
        });

        // Add new theme class
        document.body.classList.add(theme);
        
        // Toggle dark mode class
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Save preferences
        localStorage.setItem('theme', theme);
        localStorage.setItem('isDark', isDark);
    }, [theme, isDark]);

    const changeTheme = (newTheme) => {
        setTheme(newTheme);
    };

    const toggleDarkMode = () => {
        setIsDark(prev => !prev);
    };

    return (
        <ThemeContext.Provider 
            value={{ 
                theme,
                isDark,
                changeTheme,
                toggleDarkMode,
                themeOptions: THEME_OPTIONS 
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};