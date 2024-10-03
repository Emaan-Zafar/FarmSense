import { useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Box, Card, Grid, Typography, Avatar } from '@mui/material';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { AnalyticsConversionRates } from 'src/components/dashboard_charts/analytics-conversion-rates';
import { AnalyticsWebsiteVisits } from 'src/components/dashboard_charts/analytics-website-visits';

// Sample mock data for visuals
const mockCowData = {
  id: 'Cow-123',
  name: 'Bella',
  breed: 'Holstein Friesian',
  sex: 'Female',
  age: '5 years',
  height: '55 inches',
  weight: '600 kg',
  color: 'Black and White',
  milkProduced: 400,
  feedConsumption: 50,
  status: 'Healthy',
  avatarUrl: 'public/images/avatar/avatar-1.jpg', // Ensure this matches the user table avatarUrl
  history: {
    vaccines: ['Bovine Viral Diarrhea', 'Brucellosis'],
    pastDiseases: ['Mastitis', 'Foot and Mouth Disease'],
    birthDate: '2019-05-01',
    otherNotes: 'No known allergies.',
  },
};

export default function CowDetailsPage() {
  const { id } = useParams(); // Get the cow id from the URL
  const location = useLocation();
  const cowData = location.state?.cowData || mockCowData;

  return (
    <>
      <Helmet>
        <title>{`Cow Details - ${cowData.name}`}</title>
      </Helmet>

      <DashboardLayout>
        <Box display="flex" justifyContent="flex-start" alignItems="center" mb={5} ml={3}>
          <Typography variant="h4" gutterBottom>
            Cow Details: {cowData.name} (ID: {id})
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {/* General Info */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                borderRadius: '16px',
                padding: 2,
              }}
            >
              <Avatar
                alt={cowData.name}
                src={cowData.avatarUrl} // Using avatar URL from cow data
                sx={{ width: 100, height: 100, marginRight: 2 }}
              />
              <Box>
                <Typography variant="h5">{cowData.name}</Typography>
                <Typography variant="body2">ID: {cowData.id}</Typography>
                <Typography variant="body2">Breed: {cowData.breed}</Typography>
                <Typography variant="body2">Sex: {cowData.sex}</Typography>
                <Typography variant="body2">Age: {cowData.age}</Typography>
                <Typography variant="body2">Color: {cowData.color}</Typography>
                <Typography variant="body2">Height: {cowData.height}</Typography>
                <Typography variant="body2">Weight: {cowData.weight}</Typography>
                <Typography variant="body2">Status: {cowData.status}</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} justifyContent="center" mt={4}>
          {/* Milk Production Chart */}
          <Grid item xs={12} md={6}>
            {cowData.sex === 'Female' && (
              <Card
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                  borderRadius: '16px',
                  padding: 3,
                }}
              >
                <AnalyticsConversionRates
                  title="Milk Produced"
                  chart={{
                    categories: ['Month 1', 'Month 2', 'Month 3'],
                    series: [
                      {
                        name: 'Milk Production',
                        data: [300, 350, 400],
                      },
                    ],
                  }}
                />
              </Card>
            )}
          </Grid>

          {/* Feed Consumption Chart */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                borderRadius: '16px',
                padding: 3,
              }}
            >
              <AnalyticsWebsiteVisits
                title="Feed Consumption"
                chart={{
                  categories: ['Week 1', 'Week 2', 'Week 3'],
                  series: [
                    {
                      name: 'Feed Consumption',
                      data: [45, 50, 55],
                    },
                  ],
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </DashboardLayout>
    </>
  );
}
