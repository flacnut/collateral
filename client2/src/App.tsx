import './App.css';
import { AppBar, Box, CssBaseline, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu } from '@mui/icons-material';
import { Routes, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function ThemedApp() {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

function App() {

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" enableColorOnDark>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Collateral
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<div>home</div>} />
            <Route path="transactions" element={<div>transactions</div>} />
            <Route path="accounts" element={<div>accounts</div>} />
          </Routes>
        </BrowserRouter>
      </Box>
    </>
  );
}

export default ThemedApp;
