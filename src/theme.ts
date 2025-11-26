import { createTheme } from '@mui/material/styles';

export type ThemeColor = 'Red' | 'Blue' | 'Green' | 'Purple' | 'Orange' | 'Dynamic';

export const themeColors: Record<ThemeColor, { primary: string; gradient: string }> = {
  Red: {
    primary: '#E50914',
    gradient: 'linear-gradient(180deg, #220000 0%, #000000 100%)',
  },
  Blue: {
    primary: '#1E88E5',
    gradient: 'linear-gradient(180deg, #001122 0%, #000000 100%)',
  },
  Green: {
    primary: '#43A047',
    gradient: 'linear-gradient(180deg, #002200 0%, #000000 100%)',
  },
  Purple: {
    primary: '#8E24AA',
    gradient: 'linear-gradient(180deg, #220022 0%, #000000 100%)',
  },
  Orange: {
    primary: '#FB8C00',
    gradient: 'linear-gradient(180deg, #221100 0%, #000000 100%)',
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
        paper: '#121212',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B3B3B3',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
