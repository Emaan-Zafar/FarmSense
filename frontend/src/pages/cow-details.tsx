import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Box, Card, Grid, Typography, Avatar } from '@mui/material';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { AnalyticsConversionRates } from 'src/components/dashboard_charts/analytics-conversion-rates';
import { AnalyticsWebsiteVisits } from 'src/components/dashboard_charts/analytics-website-visits';
import axios from 'axios';

interface DiseaseData {
  labels: string[];
  values: number[];
}

interface ActivityData {
  hour: number;
  activityLevel: number;
}

export default function CowDetailsPage() {
  const avatarUrl = '/assets/images/avatar/avatar-1.jpg'
  const navigate = useNavigate();
  const { state } = useLocation();
  const { cowData } = state || {}; // Get cowData from state

  const [chartData, setChartData] = useState<{
    categories: string[];
    series: { name: string; data: number[] }[];
  }>({
    categories: [],
    series: [],
  });

  const [activityChartData, setActivityChartData] = useState<{
    categories: string[];
    series: { name: string; data: number[] }[];
  }>({
    categories: [],
    series: [],
  });
  
  // Set initial form values from cowData
  const [id, setId] = useState(cowData?.Id || '');
  const [sex, setSex] = useState(cowData?.Sex || '');
  const [color, setColor] = useState(cowData?.Color || '');
  const [breed, setBreed] = useState(cowData?.Breed || '');
  const [age, setAge] = useState(cowData?.Age || '');
  const [height, setHeight] = useState(cowData?.Height || '');
  const [weight, setWeight] = useState(cowData?.Weight || '');
  const [status, setStatus] = useState(cowData?.Status || '');

  // Function to process the fetched data into { label, value } format
  const processChartData = (labels: string[], values: number[]) => ({
    categories: labels,  // Labels for x-axis
    series: [
      {
        name: 'Probability',   // Customize the series name
        data: values.map((value) => parseFloat((value / 100).toFixed(3))) // Process and round the values
      }
    ]
  });

  const processActivityData = (hours: number[], activityLevels: number[]) => ({
  categories: hours.map(hour => `${hour}`), // Format hours for x-axis labels
  series: [
    {
      name: 'Activity Levels', // Customize the series name
      data: activityLevels.map((level) => parseFloat(level.toFixed(3))), // Round the values
    },
  ],
});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/disease/fetch-cow-activity/${id}`);
        const { hours, activityLevels } = response.data;
  
        // Process the data for chart
        const transformedData = processActivityData(hours, activityLevels);
        setActivityChartData(transformedData);  // Update state with processed chart data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [id]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<DiseaseData>(`http://localhost:4000/disease/fetch-data/${id}`);
        const { labels, values } = response.data;
  
        // Process the data for chart
        const transformedData = processChartData(labels, values);
        setChartData(transformedData);  // Assuming setChartData is your state setter for chart data
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [id]);
  
  // useEffect(() => {
  //   if (weight) {
  //     const calculatedStatus = weight > 200 ? 'Healthy' : 'Unhealthy';
  //     setStatus(calculatedStatus);
  //   }
  // }, [weight]);

  return (
    <>
      <Helmet>
        <title>{`Cow Details - ${id}`}</title>
      </Helmet>

      <DashboardLayout>
        <Box display="flex" justifyContent="flex-start" alignItems="center" mb={5} ml={3} mt={2}>
          <Typography variant="h4" gutterBottom>
            {/* Cow Details: {cowData.name} (ID: {id}) */}
            Cow Details: (ID - {id})
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
                // alt={cowData.name}
                src={avatarUrl} // Using avatar URL from cow data
                sx={{ width: 100, height: 100, marginRight: 2 }}
              />
              <Box>
                {/* <Typography variant="h5">{cowData.name}</Typography> */}
                <Typography variant="body2">ID: {id}</Typography>
                <Typography variant="body2">Breed: {breed}</Typography>
                <Typography variant="body2">Sex: {sex}</Typography>
                <Typography variant="body2">Age: {age}</Typography>
                <Typography variant="body2">Color: {color}</Typography>
                <Typography variant="body2">Height: {height}</Typography>
                <Typography variant="body2">Weight: {weight}</Typography>
                <Typography variant="body2">Status: {status}</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} justifyContent="center" mt={4}>
          {/* Milk Production Chart */}
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
                  title="Cow Activity Level"
                  chart={activityChartData}
                  tooltipLabel="activity level"
                />
              </Card>
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
                title="Disease Prediction"
                chart={chartData}
                tooltipLabel="chance"
              />
            </Card>
          </Grid>
        </Grid>
      </DashboardLayout>
    </>
  );
}
