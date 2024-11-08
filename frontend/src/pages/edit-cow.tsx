import { useState, useCallback, useEffect } from 'react';
import { Box, TextField, Button, Card, Typography, Grid } from '@mui/material';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { useLocation, useNavigate } from 'react-router-dom';  // Updated import
import { Scrollbar } from 'src/components/scrollbar';
import { useRouter } from 'src/routes/hooks';
import axios from 'axios';

export default function EditCow() {
  // const router = useRouter();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cowData } = state || {}; // Get cowData from state

  // Set initial form values from cowData
  const [id, setId] = useState(cowData?.Id || '');
  const [sex, setSex] = useState(cowData?.Sex || '');
  const [color, setColor] = useState(cowData?.Color || '');
  const [breed, setBreed] = useState(cowData?.Breed || '');
  const [age, setAge] = useState(cowData?.Age || '');
  const [height, setHeight] = useState(cowData?.Height || '');
  const [weight, setWeight] = useState(cowData?.Weight || '');
  const [status, setStatus] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (weight) {
      const calculatedStatus = weight > 200 ? 'healthy' : 'unhealthy';
      setStatus(calculatedStatus);
    }
  }, [weight]);

  
  const handleCancel = () => {
    navigate('/dashboard/catalog'); // Redirect to dashboard or any other desired page
  };

  const handleSubmit = async () => {
    // Simple validation
    if (!breed || !sex || !color || Number.isNaN(Number(age)) || Number(age) <= 0 || 
    Number.isNaN(Number(weight)) || Number(weight) <= 0 || Number.isNaN(Number(height)) || Number(height) <= 0) {
      setError('Please fill out all required fields with valid data');
      return;
    }
   
    try {
      // Assuming you have an API to update the cow data
      await axios.put(`http://localhost:4000/api/catalog/${id}`, {
        Sex: sex,
        Color: color,
        Breed: breed,
        Age: Number(age),
        Height: Number(height),
        Weight: Number(weight),
      });

      // Redirect back to catalog page or show success message
      navigate('/dashboard/catalog');
    } catch (err) {
      console.error('Error updating cow:', err);
      setError('Failed to update cow. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <Box display="flex" alignItems="center" mb={5} mt={2} sx={{ ml: 4, mt: 3 }}>
        <Typography variant="h4" flexGrow={1}>
          Edit Cow
        </Typography>
      </Box>

      <Card
        sx={{
          backgroundColor: '#7b8687',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          borderRadius: '16px',
          padding: 3,
          margin: 'auto',
          mt: 0, // Slightly above
          width: 1000,
          ml: 15,  // Shifted to the left
        }}
      >
        <Scrollbar>
          <Box display="flex" flexDirection="column" gap={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Breed"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  required
                  fullWidth
                  // Added margin-top to create space between the label and input field
                  InputLabelProps={{ style: { marginTop: 10 } }}
                  error={!breed && !!error}
                  helperText={!breed && !!error ? 'Breed is required' : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  required
                  fullWidth
                  // Added margin-top to create space between the label and input field
                  InputLabelProps={{ style: { marginTop: 10 } }}
                  error={!sex && !!error}
                  helperText={!sex && !!error ? 'Sex is required' : ''}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  fullWidth
                  // Added margin-top to create space between the label and input field
                  InputLabelProps={{ style: { marginTop: 10 } }}
                  error={(Number.isNaN(Number(age)) || Number(age) <= 0) && !!error}
                  helperText={(Number.isNaN(Number(age)) || Number(age) <= 0) && !!error ? 'Age must be a valid number' : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  fullWidth
                  // Added margin-top to create space between the label and input field
                  InputLabelProps={{ style: { marginTop: 10 } }}
                  error={(Number.isNaN(Number(weight)) || Number(weight) <= 0) && !!error}
                  helperText={(Number.isNaN(Number(weight)) || Number(weight) <= 0) && !!error ? 'Weight must be a valid number' : ''}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Height (inches)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                  fullWidth
                  // Added margin-top to create space between the label and input field
                  InputLabelProps={{ style: { marginTop: 10 } }}
                  error={(Number.isNaN(Number(height)) || Number(height) <= 0) && !!error}
                  helperText={(Number.isNaN(Number(height)) || Number(height) <= 0) && !!error ? 'Height must be a valid number' : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                  fullWidth
                  // Added margin-top to create space between the label and input field
                  InputLabelProps={{ style: { marginTop: 10 } }}
                  error={!color && !!error}
                  helperText={!color && !!error ? 'Color is required' : ''}
                />
              </Grid>
            </Grid>

            {/* Display non-editable fields */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              ID: {id}
            </Typography>
            <Typography variant="subtitle1">
              Status: {status}
            </Typography>

            {error && <Typography color="error">{error}</Typography>}

            <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ backgroundColor: '#30ac66', color: 'white', '&:hover': { backgroundColor: '#f57c00' } }} // Change button color // Cancel button with secondary color
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
              >
                Update Cow
              </Button>
            </Box>
          </Box>
        </Scrollbar>
      </Card>
    </DashboardLayout>
  );
}
