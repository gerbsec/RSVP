import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalAttending: 0,
    totalNotAttending: 0,
    totalGuests: 0
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        fetchRSVPs();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Error logging in');
    } finally {
      setLoading(false);
    }
  };

  const fetchRSVPs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/rsvps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('adminToken');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch RSVPs');
      }
      
      const data = await response.json();
      setRsvps(data.rsvps);
      setStats(data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchRSVPs();
    } else {
      setLoading(false);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: '400px',
            width: '100%',
            mx: 2,
            borderRadius: '20px'
          }}
        >
          <Typography variant="h4" gutterBottom align="center" sx={{ color: '#FFB6C1', mb: 4 }}>
            Admin Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #FFB6C1 30%, #FFC0CB 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFC0CB 30%, #FFB6C1 90%)'
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 4, background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#FFB6C1', mb: 4 }}>
          RSVP Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '15px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Responses
                </Typography>
                <Typography variant="h4" sx={{ color: '#FFB6C1' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '15px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Attending
                </Typography>
                <Typography variant="h4" sx={{ color: '#FFB6C1' }}>
                  {stats.attending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '15px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Not Attending
                </Typography>
                <Typography variant="h4" sx={{ color: '#FFB6C1' }}>
                  {stats.not_attending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '15px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Guests
                </Typography>
                <Typography variant="h4" sx={{ color: '#FFB6C1' }}>
                  {stats.total_guests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ borderRadius: '15px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Additional Guests</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rsvps.map((rsvp) => (
                <TableRow key={rsvp.id}>
                  <TableCell>{`${rsvp.first_name} ${rsvp.last_name}`}</TableCell>
                  <TableCell>{rsvp.email}</TableCell>
                  <TableCell>{rsvp.phone}</TableCell>
                  <TableCell>
                    {rsvp.response === 'yes' ? (
                      <Typography color="primary">Attending</Typography>
                    ) : (
                      <Typography color="error">Not Attending</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {rsvp.additional_guests?.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {rsvp.additional_guests.map((guest, index) => (
                          <li key={index}>
                            {guest.firstName} {guest.lastName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'None'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </motion.div>
  );
};

export default AdminDashboard;