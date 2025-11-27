import { createTheme } from '@mui/material/styles';

export type ThemeColor = 'Red' | 'Blue' | 'Green' | 'Purple' | 'Orange' | 'Dynamic';

export const themeColors: Record<ThemeColor, { primary: string; gradient: string }> = {
  Red: {
    primary: '#FF1744', // More vibrant red
    gradient: 'linear-gradient(180deg, #330000 0%, #000000 100%)',
  },
  Blue: {
    primary: '#2979FF', // More vibrant blue
    gradient: 'linear-gradient(180deg, #001133 0%, #000000 100%)',
  },
  Green: {
    primary: '#00E676', // More vibrant green
    gradient: 'linear-gradient(180deg, #003300 0%, #000000 100%)',
  },
  Purple: {
    primary: '#D500F9', // More vibrant purple
    gradient: 'linear-gradient(180deg, #330033 0%, #000000 100%)',
  },
  Orange: {
    primary: '#FF9100', // More vibrant orange
    gradient: 'linear-gradient(180deg, #331100 0%, #000000 100%)',
  },
  Dynamic: {
    primary: '#ffffff',
    gradient: 'linear-gradient(180deg, #333333 0%, #000000 100%)',
  }
};

export const createAppTheme = (color: ThemeColor, dynamicPrimary?: string) => {
  let { primary } = themeColors[color];
  
  if (color === 'Dynamic' && dynamicPrimary) {
    primary = dynamicPrimary;
  }

  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: primary,
      },
      background: {
        default: '#000000',
        paper: '#1A1A1A', // Slightly lighter for better contrast
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B3B3B3',
      },
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      body1: { fontWeight: 400 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#000000',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: '#000000' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#333', borderRadius: '4px' },
          },
        },
      },
    },
  });
};
