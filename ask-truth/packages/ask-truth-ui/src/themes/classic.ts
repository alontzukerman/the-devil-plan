import type { Theme } from '../types/theme';

export const classicTheme: Theme = {
    name: 'classic',
    colors: {
        // Primary - Yellow/Amber (current game primary)
        primary: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24', // Current yellow-400
            500: '#f59e0b', // Primary yellow
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
        },
        // Secondary - Indigo/Purple (current game accent)
        secondary: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc', // Current indigo-300
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
            950: '#1e1b4b',
        },
        // Neutral - Gray scale (current game backgrounds)
        neutral: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb', // Current gray-200
            300: '#d1d5db', // Current gray-300
            400: '#9ca3af', // Current gray-400
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151', // Current gray-700
            800: '#1f2937', // Current gray-800 (slate-800)
            900: '#111827',
            950: '#030712',
        },
        // Semantic colors
        semantic: {
            success: '#10b981', // Current green-500
            error: '#ef4444',   // Current red-500
            warning: '#f59e0b', // Same as primary-500
            info: '#3b82f6',    // Current blue-500
        },
    },
    spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '2.5rem', // 40px
        '3xl': '3rem',   // 48px
        '4xl': '4rem',   // 64px
    },
    typography: {
        fontFamily: {
            sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
            title: 'Cinzel Decorative, serif', // Current font-cinzel-decorative
        },
        fontSize: {
            xs: '0.75rem',   // 12px
            sm: '0.875rem',  // 14px
            base: '1rem',    // 16px
            lg: '1.125rem',  // 18px
            xl: '1.25rem',   // 20px
            '2xl': '1.5rem', // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem',  // 36px - Current text-4xl
            '5xl': '3rem',     // 48px - Current text-5xl
            '6xl': '3.75rem',  // 60px - Current text-6xl
        },
        fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600', // Current font-semibold
            bold: '700',     // Current font-bold
        },
        lineHeight: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
        },
    },
    borderRadius: {
        none: '0px',
        sm: '0.125rem', // 2px
        md: '0.375rem', // 6px
        lg: '0.5rem',   // 8px - Current rounded-lg
        full: '9999px', // Current rounded-full
    },
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Current shadow-xl
    },
}; 