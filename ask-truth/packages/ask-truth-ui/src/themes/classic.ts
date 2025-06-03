import type { Theme } from '../types/theme';

export const classicTheme: Theme = {
    name: 'classic',
    colors: {
        // Primary - Rich Emerald (sophisticated green)
        primary: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981', // Primary emerald
            600: '#059669', // Rich emerald
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
            950: '#022c22',
        },
        // Secondary - Warm Copper (rich orange-brown)
        secondary: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c', // Warm copper
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
            950: '#431407',
        },
        // Neutral - Warm grays (sophisticated stone palette)
        neutral: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
            950: '#0c0a09',
        },
        // Semantic colors - Updated to complement the new palette
        semantic: {
            success: '#059669', // Emerald-600 (matches primary)
            error: '#dc2626',   // Red-600 (classic red)
            warning: '#ea580c', // Copper-600 (matches secondary)
            info: '#0891b2',    // Cyan-600 (complements palette)
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