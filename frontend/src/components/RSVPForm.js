import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { motion } from 'framer-motion';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFB6C1',
    },
    secondary: {
      main: '#FFC0CB',
    },
    background: {
      default: '#FFF0F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Playfair Display", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '30px',
          textTransform: 'none',
          fontSize: '1.1rem',
          padding: '10px 30px',
          background: 'linear-gradient(45deg, #FFB6C1 30%, #FFC0CB 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FFC0CB 30%, #FFB6C1 90%)'
          }
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '15px',
            '&:hover fieldset': {
              borderColor: '#FFB6C1',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

const createFlowers = () => {
  const newFlowers = [];
  const numFlowers = 50; // Reduced number of flowers
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Create a simple grid
  const rows = 5;
  const cols = 10;
  const cellWidth = viewportWidth / cols;
  const cellHeight = viewportHeight / rows;

  for (let i = 0; i < numFlowers; i++) {
    // Calculate position based on grid
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    // Add some randomness within the cell
    const x = (col * cellWidth) + (Math.random() * cellWidth * 0.8);
    const y = (row * cellHeight) + (Math.random() * cellHeight * 0.8);

    newFlowers.push({
      id: i,
      x,
      y,
      scale: 0.6 + Math.random() * 0.4,
      rotation: Math.random() * 360,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
      type: (i % 3) + 1
    });
  }

  return newFlowers;
};

const RSVPForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    response: 'yes',
    additionalGuests: []
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [flowers, setFlowers] = useState([]);

  useEffect(() => {
    setFlowers(createFlowers());
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuestChange = (index, field, value) => {
    const newGuests = [...formData.additionalGuests];
    newGuests[index] = {
      ...newGuests[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      additionalGuests: newGuests
    }));
  };

  const addGuest = () => {
    if (formData.additionalGuests.length < 3) {
      setFormData(prev => ({
        ...prev,
        additionalGuests: [...prev.additionalGuests, { firstName: '', lastName: '' }]
      }));
    }
  };

  const removeGuest = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          response: 'yes',
          additionalGuests: []
        });
      } else {
        setShowError(true);
      }
    } catch (error) {
      setShowError(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)'
      }}
    >
      {/* Background flowers */}
      {flowers.map((flower) => (
        <motion.div
          key={flower.id}
          style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            background: `url(/images/flower${flower.type}.png) no-repeat center/contain`,
            opacity: 0.9,
            transform: `scale(${flower.scale})`
          }}
          animate={{
            x: [flower.x, flower.x + (Math.random() * 40 - 20)],
            y: [flower.y, flower.y + (Math.random() * 40 - 20)],
            rotate: [flower.rotation, flower.rotation + 360],
            scale: [flower.scale, flower.scale * 1.1, flower.scale]
          }}
          transition={{
            duration: flower.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: flower.delay
          }}
        />
      ))}

      <ThemeProvider theme={theme}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4 },
            maxWidth: '800px',
            width: '100%',
            mx: 2,
            position: 'relative',
            zIndex: 1,
            borderRadius: '20px'
          }}
        >
          <Typography variant="h4" gutterBottom align="center" sx={{ color: '#FFB6C1', mb: 4, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            RSVP
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ color: '#666' }}>Will you attend?</FormLabel>
                  <RadioGroup
                    row
                    name="response"
                    value={formData.response}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {formData.response === 'yes' && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#666' }}>Additional Guests</Typography>
                      <IconButton
                        onClick={addGuest}
                        disabled={formData.additionalGuests.length >= 3}
                        sx={{ ml: 1, color: '#FFB6C1' }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>

                  {formData.additionalGuests.map((guest, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          borderRadius: '15px'
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              fullWidth
                              label="First Name"
                              value={guest.firstName}
                              onChange={(e) => handleGuestChange(index, 'firstName', e.target.value)}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <TextField
                              fullWidth
                              label="Last Name"
                              value={guest.lastName}
                              onChange={(e) => handleGuestChange(index, 'lastName', e.target.value)}
                              required
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <IconButton
                              onClick={() => removeGuest(index)}
                              sx={{ mt: 1, color: '#FFB6C1' }}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Submit RSVP
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </ThemeProvider>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          RSVP submitted successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          Error submitting RSVP. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RSVPForm;