import type { Theme, ThemeName } from '../types/theme';
import { classicTheme } from '../themes/classic';

// Theme registry
const themes: Record<ThemeName, Theme> = {
    classic: classicTheme,
    // Future themes will be added here
    neon: classicTheme, // Placeholder
    elegant: classicTheme, // Placeholder
};

/**
 * Get a theme by name
 */
export const getTheme = (name: ThemeName): Theme => {
    return themes[name] || themes.classic;
};

/**
 * Get all available theme names
 */
export const getThemeNames = (): ThemeName[] => {
    return Object.keys(themes) as ThemeName[];
};

/**
 * Convert theme to CSS custom properties
 */
export const themeToCSSProperties = (theme: Theme): Record<string, string> => {
    const cssProps: Record<string, string> = {};

    // Colors
    Object.entries(theme.colors.primary).forEach(([shade, color]) => {
        cssProps[`--color-primary-${shade}`] = color;
    });

    Object.entries(theme.colors.secondary).forEach(([shade, color]) => {
        cssProps[`--color-secondary-${shade}`] = color;
    });

    Object.entries(theme.colors.neutral).forEach(([shade, color]) => {
        cssProps[`--color-neutral-${shade}`] = color;
    });

    Object.entries(theme.colors.semantic).forEach(([name, color]) => {
        cssProps[`--color-${name}`] = color;
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([size, value]) => {
        cssProps[`--spacing-${size}`] = value;
    });

    // Typography
    Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
        cssProps[`--font-size-${size}`] = value;
    });

    Object.entries(theme.typography.fontWeight).forEach(([weight, value]) => {
        cssProps[`--font-weight-${weight}`] = value;
    });

    Object.entries(theme.typography.fontFamily).forEach(([family, value]) => {
        cssProps[`--font-family-${family}`] = value;
    });

    // Border radius
    Object.entries(theme.borderRadius).forEach(([size, value]) => {
        cssProps[`--border-radius-${size}`] = value;
    });

    // Shadows
    Object.entries(theme.shadows).forEach(([size, value]) => {
        cssProps[`--shadow-${size}`] = value;
    });

    return cssProps;
};

/**
 * Generate CSS class utilities from theme
 */
export const generateUtilityClasses = (theme: Theme): string => {
    let css = '';

    // Background colors
    Object.entries(theme.colors.primary).forEach(([shade, color]) => {
        css += `.bg-primary-${shade} { background-color: ${color}; }\n`;
    });

    // Text colors
    Object.entries(theme.colors.primary).forEach(([shade, color]) => {
        css += `.text-primary-${shade} { color: ${color}; }\n`;
    });

    // Add more utility classes as needed...

    return css;
}; 