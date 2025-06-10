import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AnimatePresence } from 'framer-motion';
import { ColorExtractor } from 'react-color-extractor';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Components
import Envelope from './components/Envelope';
import RSVPForm from './components/RSVPForm';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [colors, setColors] = useState({
    primary: '#4a90e2',
    secondary: '#f5a623',
    background: '#ffffff'
  });

  const theme = createTheme({
    palette: {
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: colors.background,
      },
    },
  });

  const handleColors = (colors) => {
    setColors({
      primary: colors[0],
      secondary: colors[1],
      background: colors[2] || '#ffffff'
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ColorExtractor
        src="/rsvp.jpg"
        getColors={handleColors}
      />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Envelope />} />
              <Route path="/rsvp" element={<RSVPForm />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </AnimatePresence>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;