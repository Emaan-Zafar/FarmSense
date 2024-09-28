import { useState, useCallback, useEffect } from 'react';
import { Box, TextField, Button, Card, Typography, Grid } from '@mui/material';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { useLocation, useNavigate } from 'react-router-dom';  // Updated import
import { Scrollbar } from 'src/components/scrollbar';
import { _users } from 'src/_mock/_data';
import { useRouter } from 'src/routes/hooks';

// Avatar logic
const getAvatar = (index: number) => {
  const avatarIndex = (index % 4) + 1;
  const avatarExtension = avatarIndex === 2 ? 'webp' : 'jpg';
  return `/assets/images/avatar/avatar-${avatarIndex}.${avatarExtension}`;
};

export default function EditCow() {
  const location = useLocation(); // Get passed cow data from router
  const { cowData } = location.state; // Get the cow data passed from the table
  const navigate = useNavigate();  // Updated to useNavigate

  const [breed, setBreed] = useState<string>('');
  const [sex, setSex] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Populate the form with existing cow data on component mount
  useEffect(() => {
    if (cowData) {
      setBreed(cowData.breed);
      setSex(cowData.sex);
      setAge(cowData.age);
      setWeight(cowData.weight);
      setHeight(cowData.height);
      setColor(cowData.color);
    }
  }, [cowData]);

  const handleSubmit = useCallback(() => {
    if (!breed || !sex || !age || !weight || !height || !color) {
      setError('All fields are required');
      return;
    }

    if (Number.isNaN(Number(age)) || Number(age) <= 0) {
      setError('Age must be a valid positive number');
      return;
    }

    if (Number.isNaN(Number(weight)) || Number(weight) <= 0) {
      setError('Weight must be a valid positive number');
      return;
    }

    if (Number.isNaN(Number(height)) || Number(height) <= 0) {
      setError('Height must be a valid positive number');
      return;
    }

    // Update cow information in the backend or state
    const updatedCow = {
      ...cowData, // Keep existing id and status
      breed,
      sex,
      age,
      weight,
      height,
      color,
    };

    // Assuming _users is where the data is stored (you can replace this with actual backend logic)
    const cowIndex = _users.findIndex((cow) => cow.id === cowData.id);
    if (cowIndex !== -1) {
      _users[cowIndex] = updatedCow;
    }

    // Navigate back to the user table page
    navigate('/dashboard/catalog');  // Updated to navigate
  }, [breed, sex, age, weight, height, color, cowData, navigate]);

  const router = useRouter();

  const handleCancel = () => {
    router.push('/dashboard/catalog'); // Redirect to dashboard or any other desired page
  };

  return (
    <DashboardLayout>
      <Box display="flex" alignItems="center" mb={5} sx={{ ml: 4, mt: 3 }}>
        <Typography variant="h4" flexGrow={1}>
          Edit Cow
        </Typography>
      </Box>

      <Card
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
                  label="Height (cm)"
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
              ID: {cowData.id}
            </Typography>
            <Typography variant="subtitle1">
              Status: {cowData.status}
            </Typography>

            {error && <Typography color="error">{error}</Typography>}

            <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                color="secondary" // Cancel button with secondary color
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
