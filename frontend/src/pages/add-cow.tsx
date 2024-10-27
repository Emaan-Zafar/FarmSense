import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Card, Typography, Grid } from '@mui/material';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { Scrollbar } from 'src/components/scrollbar';
import axios from 'axios';

export default function AddCow() {
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [color, setColor] = useState('');
  const [id, setId] = useState('');
  const [error, setError] = useState<string | null>(null); // Manage errors
  const navigate = useNavigate();  // Used for navigation after form submission

  const handleSubmit = async () => {
    try {
      // Check if any required fields are empty
      if (!breed || !sex || !age || !weight || !height || !color || !id) {
        setError('All fields are required');
        return;
      }

      // Clear any previous error message
      setError(null);

      // Make POST request to add the new cow to the database
      await axios.post('http://localhost:4000/api/catalog', {
        Id: id,
        Sex: sex,
        Color: color,
        Breed: breed,
        Age: Number(age),
        Height: Number(height),
        Weight: Number(weight)
      });

      // Redirect to the catalog page after successful submission
      navigate('/dashboard/catalog');
    } catch (err) {
      console.error('Error adding cow:', err);
      setError('Failed to add cow. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <Box display="flex" alignItems="center" mb={5} sx={{ ml: 4, mt: 3}}>
        <Typography variant="h4" flexGrow={1}>
          Add New Cow
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
          mt: 5, // Slightly above
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
                  error={!color && !!error}
                  helperText={!color && !!error ? 'Color is required' : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                  fullWidth
                  error={!id && !!error}
                  helperText={!id && !!error ? 'Id is required' : ''}
                />
              </Grid>
            </Grid>

            {error && <Typography color="error">{error}</Typography>}

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ backgroundColor: '#30ac66', color: 'white', '&:hover': { backgroundColor: '#f57c00' } }} // Change button color
            >
              Submit
            </Button>
          </Box>
        </Scrollbar>
      </Card>
    </DashboardLayout>
  );
}
