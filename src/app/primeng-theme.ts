import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Custom PrimeNG preset that mirrors the project's Tailwind color palette.
 *
 * Brand palette reference (from src/tailwind.css @theme block):
 *  Primary  – violet:  #8b5cf6 / #7c3aed
 *  Secondary – cyan:   #22d3ee / #06b6d4
 *  Surface bg:         #0a0b14
 *  Surface raised:     #11131f
 *  Surface overlay:    #1b1d33
 *  Surface border:     #2f3255
 *  Text base:          #f5f3ff
 *  Text subtle:        #c4b5fd
 *  Text muted:         #7c6fad
 */
export const AppTheme = definePreset(Aura, {
    primitive: {
        borderRadius: {
            none: '0',
            xs: '0.25rem',
            sm: '0.375rem',
            md: '0.5rem',
            lg: '0.75rem',
            xl: '1rem',
        },

        // Violet scale – aligned to the project's primary violet
        violet: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
            950: '#2e1065',
        },

        // Cyan scale – aligned to the project's secondary cyan
        cyan: {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
            950: '#083344',
        },
    },

    semantic: {
        primary: {
            50: '{violet.50}',
            100: '{violet.100}',
            200: '{violet.200}',
            300: '{violet.300}',
            400: '{violet.400}',
            500: '{violet.500}',
            600: '{violet.600}',
            700: '{violet.700}',
            800: '{violet.800}',
            900: '{violet.900}',
            950: '{violet.950}',
        },

        colorScheme: {
            dark: {
                primary: {
                    color: '{violet.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{violet.600}',
                    activeColor: '{violet.700}',
                },
                highlight: {
                    background: '{violet.500}',
                    focusBackground: '{violet.600}',
                    color: '#ffffff',
                    focusColor: '#ffffff',
                },
                surface: {
                    0: '#ffffff',
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#c4b5fd',
                    300: '#7c6fad',
                    400: '#4a4580',
                    500: '#2f3255',
                    600: '#1b1d33',
                    700: '#11131f',
                    800: '#0d0f1a',
                    900: '#0a0b14',
                    950: '#07080e',
                },
                text: {
                    color: '#f5f3ff',
                    hoverColor: '#ffffff',
                    mutedColor: '#7c6fad',
                    hoverMutedColor: '#c4b5fd',
                },
                content: {
                    background: '#11131f',
                    hoverBackground: '#1b1d33',
                    borderColor: '#2f3255',
                    color: '#f5f3ff',
                    hoverColor: '#ffffff',
                },
                overlay: {
                    select: {
                        background: '#11131f',
                        borderColor: '#2f3255',
                        color: '#f5f3ff',
                    },
                    popover: {
                        background: '#11131f',
                        borderColor: '#2f3255',
                        color: '#f5f3ff',
                    },
                    modal: {
                        background: '#11131f',
                        borderColor: '#2f3255',
                        color: '#f5f3ff',
                    },
                },
                list: {
                    option: {
                        focusBackground: '#1b1d33',
                        selectedBackground: '{violet.950}',
                        selectedFocusBackground: '{violet.900}',
                        color: '#f5f3ff',
                        focusColor: '#ffffff',
                        selectedColor: '{violet.300}',
                        selectedFocusColor: '{violet.200}',
                    },
                    optionGroup: {
                        background: '#0a0b14',
                        color: '#7c6fad',
                    },
                },
                navigation: {
                    item: {
                        focusBackground: '#1b1d33',
                        activeBackground: '{violet.950}',
                        color: '#c4b5fd',
                        focusColor: '#f5f3ff',
                        activeColor: '{violet.300}',
                    },
                    submenuLabel: {
                        background: 'transparent',
                        color: '#7c6fad',
                    },
                    submenuIcon: {
                        color: '#7c6fad',
                        focusColor: '#c4b5fd',
                        activeColor: '{violet.400}',
                    },
                },
                formField: {
                    background: '#1b1d33',
                    disabledBackground: '#11131f',
                    filledBackground: '#1b1d33',
                    filledHoverBackground: '#1b1d33',
                    filledFocusBackground: '#1b1d33',
                    borderColor: '#2f3255',
                    hoverBorderColor: '{violet.500}',
                    focusBorderColor: '{violet.500}',
                    invalidBorderColor: '#f43f5e',
                    color: '#f5f3ff',
                    disabledColor: '#7c6fad',
                    placeholderColor: '#7c6fad',
                    invalidPlaceholderColor: '#f43f5e',
                    floatLabelColor: '#7c6fad',
                    floatLabelFocusColor: '{violet.400}',
                    floatLabelActiveColor: '{violet.400}',
                    floatLabelInvalidColor: '#f43f5e',
                    iconColor: '#7c6fad',
                    shadow: 'none',
                },
            },
        },
    },
});
