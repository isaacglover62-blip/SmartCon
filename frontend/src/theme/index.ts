import { createTheme } from '@mui/material'

export function createAppTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb', light: '#60a5fa', dark: '#1d4ed8', contrastText: '#fff' },
      secondary: { main: '#0ea5e9', light: '#38bdf8', dark: '#0284c7' },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      info: { main: '#06b6d4' },
      background: mode === 'dark'
        ? { default: '#0f0f23', paper: '#1e1e2e' }
        : { default: '#f8fafc', paper: '#ffffff' },
      text: mode === 'dark'
        ? { primary: '#cdd6f4', secondary: '#a6adc8' }
        : { primary: '#1e293b', secondary: '#64748b' },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'medium' },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          },
        },
      },
    },
  })
}
