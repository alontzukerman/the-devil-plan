export interface ColorScale {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
}

export interface SemanticColors {
    success: string;
    error: string;
    warning: string;
    info: string;
}

export interface ThemeColors {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
}

export interface SpacingScale {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
}

export interface Typography {
    fontFamily: {
        sans: string;
        title: string;
    };
    fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
        '6xl': string;
    };
    fontWeight: {
        light: string;
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
    };
    lineHeight: {
        tight: string;
        normal: string;
        relaxed: string;
    };
}

export interface BorderRadius {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
}

export interface Shadows {
    sm: string;
    md: string;
    lg: string;
    xl: string;
}

export interface Theme {
    name: string;
    colors: ThemeColors;
    spacing: SpacingScale;
    typography: Typography;
    borderRadius: BorderRadius;
    shadows: Shadows;
}

export type ThemeName = 'classic' | 'neon' | 'elegant'; 