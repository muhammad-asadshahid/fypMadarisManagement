import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'System',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1B5E20',
    secondary: '#2E7D32',
    tertiary: '#4CAF50',
    surface: '#FFFFFF',
    background: '#F5F7F5',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#81C784',
    secondary: '#66BB6A',
    tertiary: '#A5D6A7',
    surface: '#1E1E1E',
    background: '#121212',
  },
  fonts: configureFonts({ config: fontConfig }),
};
