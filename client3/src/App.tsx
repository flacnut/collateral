// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// locales
import ThemeLocalization from './locales';
// components
import SnackbarProvider from './components/snackbar';
import { ThemeSettings } from './components/settings';
import { MotionLazyContainer } from './components/animate';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <MotionLazyContainer>
      <ThemeProvider>
        <ThemeSettings>
          <ThemeLocalization>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <SnackbarProvider>
                <Router />
              </SnackbarProvider>
            </LocalizationProvider>
          </ThemeLocalization>
        </ThemeSettings>
      </ThemeProvider>
    </MotionLazyContainer>
  );
}
