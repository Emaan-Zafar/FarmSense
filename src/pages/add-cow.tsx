import { useState, useCallback } from 'react';
import { Box, TextField, Button, Card, Typography, Grid } from '@mui/material';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { _users } from 'src/_mock/_data';
import { useRouter } from 'src/routes/hooks';
import { Scrollbar } from 'src/components/scrollbar';

// Avatar logic
const getAvatar = (index: number) => {
  const avatarIndex = (index % 4) + 1;
  const avatarExtension = avatarIndex === 2 ? 'webp' : 'jpg';
  return `/assets/images/avatar/avatar-${avatarIndex}.${avatarExtension}`;
};

export default function AddCow() {
  const router = useRouter();

  const [breed, setBreed] = useState<string>('');  
  const [sex, setSex] = useState<string>('');    
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>(''); 
  const [height, setHeight] = useState<string>('');
  const [color, setColor] = useState<string>(''); 
  const [error, setError] = useState<string>(''); 

  // Generate cow ID, ensuring only numeric IDs are considered
  const generateCowId = () => {
    // Get only numeric IDs from the _users array
    const numericIds = _users
      .map((cow) => parseInt(cow.id, 10))  // Convert IDs to numbers
      .filter((id) => !Number.isNaN(id));  // Filter out any NaN values

    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return maxId + 1;
  };

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

    const nextCowId = generateCowId();  // Generate a unique numeric ID
    const avatarUrl = getAvatar(_users.length);

    const newCow = {
      id: nextCowId.toString(),  // Ensure ID is stored as a string
      breed,
      sex,
      age,
      weight,
      height,
      color,
      avatarUrl,
      status: 'Healthy',
    };

    _users.push(newCow);
    router.push('/user');
  }, [breed, sex, age, weight, height, color, router]);

  return (
    <DashboardLayout>
      <Box display="flex" alignItems="center" mb={5} sx={{ ml: 4, mt: 3}}>
        <Typography variant="h4" flexGrow={1}>
          Add New Cow
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
                  label="Height (cm)"
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
            </Grid>

            {error && <Typography color="error">{error}</Typography>}

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ mt: 3 }}
            >
              Submit
            </Button>
          </Box>
        </Scrollbar>
      </Card>
    </DashboardLayout>
  );
}
