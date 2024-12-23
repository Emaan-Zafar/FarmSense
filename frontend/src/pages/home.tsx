import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { _tasks, _posts, _timeline } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsNews } from 'src/scripts/analytics-news';
import { AnalyticsTasks } from 'src/scripts/analytics-tasks';
import { AnalyticsCurrentVisits } from 'src/components/dashboard_charts/analytics-current-visits';
import { AnalyticsOrderTimeline } from 'src/scripts/analytics-order-timeline';
import { AnalyticsWebsiteVisits } from 'src/components/dashboard_charts/analytics-website-visits';
import { AnalyticsWidgetSummary } from 'src/components/dashboard_charts/analytics-widget-summary';
import { AnalyticsTrafficBySite } from 'src/scripts/analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from 'src/components/dashboard_charts/analytics-current-subject';
import { AnalyticsConversionRates } from 'src/components/dashboard_charts/analytics-conversion-rates';
import { AnalyticsWebsiteVisitsLineChart } from 'src/components/dashboard_charts/linechart';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
// ----------------------------------------------------------------------

// interface ChartData {
//   label: string;
//   value: number;
// }

interface HealthRecord {
  cow_id: string;         // Or number, depending on the type of cow_id
  body_temperature: number;
  respiratory_rate: number;
}

interface HealthChartData {
  categories: string[];   // List of cow IDs
  series: {
    name: string;
    data: number[];       // Array of numbers representing health data
  }[];
}

interface Record {
  ruminating: number;
}

interface Cow {
  cow_id: number;
  records: Record[];
}

interface ChartData2 {
  categories: string[];
  series: {
    name: string;
    data: number[];
  }[];
}

export default function Page() {
  const [unhealthyCowsCount, setUnhealthyCowsCount] = useState(0);
  const [totalCowsCount, setTotalCowsCount] = useState(0);
  const [healthyCowsCount, sethealthyCowsCount] = useState(0);
  // const [ageData, setAgeData] = useState(null);
  const [ageData, setAgeData] = useState({
    title: 'Age Distribution',
    // subheader: 'Current age statistics of the catalog',
    chart: {
      series: [],
      // colors: [],
      // options: {},
    },
  });
  // const [chartData, setChartData] = useState<ChartData[]>([]);
  const [healthChartData, setHealthChartData] = useState<HealthChartData>({
    categories: [],
    series: [
      { name: 'Body Temperature (°C)', data: [] },
      { name: 'Respiratory Rate (breaths/min)', data: [] },
    ],
  });

  useEffect(() => {
    const fetchtotalCowsCount = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/health');
        const totalCows = response.data; // Assuming the response is an array of unhealthy cows
        setTotalCowsCount(totalCows.length); // Set count of unhealthy cows
      } catch (error) {
        console.error('Error fetching unhealthy cows count:', error);
      }
    };

    const fetchUnhealthyCowsCount = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/health/unhealthy-cows');
        const unhealthyCows = response.data; // Assuming the response is an array of unhealthy cows
        setUnhealthyCowsCount(unhealthyCows.length); // Set count of unhealthy cows
      } catch (error) {
        console.error('Error fetching unhealthy cows count:', error);
      }
    };

    const fetchhealthyCowsCount = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/health/healthy-cows');
        const healthyCows = response.data; // Assuming the response is an array of unhealthy cows
        sethealthyCowsCount(healthyCows.length); // Set count of unhealthy cows
      } catch (error) {
        console.error('Error fetching healthy cows count:', error);
      }
    };

    fetchtotalCowsCount();
    fetchUnhealthyCowsCount();
    fetchhealthyCowsCount();
  }, []);
 
  useEffect(() => {
    const fetchAgeData = async () => {
      const response = await axios.get('http://localhost:4000/api/graphs/age');
      const fetchedData = response.data;
  
      const transformedData = fetchedData.map((item: string) => {
        const [label, count] = item.split(': ');
        return { label: label.trim(), value: Number(count) };
      });
  
      setAgeData((prevState) => ({
        ...prevState,
        chart: {
          ...prevState.chart,
          series: transformedData,
        },
      }));
    };

    const fetchHealthData = async () => {
      try {
        const response = await axios.get<HealthRecord[]>('http://localhost:4000/api/graphs/metrics');
        const data = response.data;
    
        // Ensure cow_id is treated as a string
        const categories = data.map((record) => String(record.cow_id)); // Convert cow_id to string
        console.log(categories);
        const bodyTemperatureData = data.map((record) => record.body_temperature);
        const respiratoryRateData = data.map((record) => record.respiratory_rate);
    
        setHealthChartData({
          categories,
          series: [
            { name: 'Body Temperature (°C)', data: bodyTemperatureData },
            { name: 'Respiratory Rate (breaths/min)', data: respiratoryRateData },
          ],
        });
        console.log('Health Chart Data:', {
          categories,
          series: [
            { name: 'Body Temperature (°C)', data: bodyTemperatureData },
            { name: 'Respiratory Rate (breaths/min)', data: respiratoryRateData },
          ],
        });
      } catch (error) {
        console.error('Error fetching health data:', error);
      }
    };
    // console.log(healthChartData);

    // const fetchRuminatingData = async () => {
    //   try {
    //     const response = await axios.get('http://localhost:4000/api/graphs/ruminating');
    //     const data: Cow[] = response.data;

    //     // Process the data for the chart
    //     const formattedData = data.map((cow) => ({
    //       name: `Cow ${cow.cow_id}`, // Label each cow by ID
    //       data: cow.records.map((record) => record.ruminating) // Use each day's ruminating value directly
    //     }));

    //     setRuminatingData(prevData => ({
    //       ...prevData,
    //       series: formattedData
    //     }));
    //   } catch (error) {
    //     console.error('Error fetching ruminating data:', error);
    //   }
    // };
  
    fetchAgeData();
    fetchHealthData();
  }, []);
  
  // const processAgeData = (ages: number[]): ChartData[] => {
  //   const ageCount: { [age: number]: number } = {};
  
  //   ages.forEach((age) => {
  //     ageCount[age] = (ageCount[age] || 0) + 1;
  //   });
  
  //   // Convert ageCount object to an array of objects for chart rendering
  //   return Object.keys(ageCount).map((age) => ({
  //     label: `${age}`,
  //     value: ageCount[Number(age)],
  //   }));
  //   };
  
  return (
    <>
      <Helmet>
        <title>{`Dashboard - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="The starting point for your next project with Minimal UI Kit, built on the newest version of Material-UI ©, ready to be customized to your style"
        />
        <meta name="keywords" content="react,material,kit,application,dashboard,admin,template" />
      </Helmet>

      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 }, mt: 2}}>
          Hi, Welcome back 👋
        </Typography>

        <Grid container spacing={3}>
          <Grid xs={12} sm={6} md={3}>
            {/* <AnalyticsWidgetSummary
              title="Total Cows"
              // percent={2.6}
              total={4}
              // icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
              // chart={{
              //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              //   series: [22, 8, 35, 50, 82, 84, 77, 12],
              // }}
            /> */}
            <AnalyticsWidgetSummary
              title="Total Cows"
              total={totalCowsCount}  // Use the dynamic unhealthy cows count
              color="error"
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            {/* <AnalyticsWidgetSummary
              title="Milking Cows"
              // percent={-0.1}
              total={4}
              color="secondary"
              // icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
              // chart={{
              //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              //   series: [56, 47, 40, 62, 73, 30, 23, 54],
              // }}
            /> */}
            <AnalyticsWidgetSummary
              title="Milking Cows"
              total={totalCowsCount}  // Use the dynamic unhealthy cows count
              color="error"
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            {/* <AnalyticsWidgetSummary
              title="Healthy Cows"
              // percent={2.8}
              total={4}
              color="warning"
              // icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
              // chart={{
              //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              //   series: [40, 70, 50, 28, 70, 75, 7, 64],
              // }}
            /> */}
            <AnalyticsWidgetSummary
              title="Healthy Cows"
              total={healthyCowsCount}  // Use the dynamic unhealthy cows count
              color="error"
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            {/* <AnalyticsWidgetSummary
              title="Unhealthy Cows"
              // percent={3.6}
              total={0}
              color="error"
              // icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
              // chart={{
              //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              //   series: [56, 30, 23, 54, 47, 40, 62, 73],
              // }}
            /> */}
            <AnalyticsWidgetSummary
              title="Unhealthy Cows"
              total={unhealthyCowsCount}  // Use the dynamic unhealthy cows count
              color="error"
            />
          </Grid>
          
          <Grid xs={12} md={6} lg={4}>
            <AnalyticsCurrentVisits {...ageData} />
            {/* <AnalyticsCurrentVisits
              title="Cattle Age Distribution"
              chart={{
                series: chartData,  // Pass the processed chart data
              }}
            /> */}
          </Grid>
          
          <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Average Milk Production"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: '6601', data: [50, 55, 60, 65, 70, 75, 80, 85, 90] }, // Average production for Cow 1
                { name: '6612', data: [45, 50, 55, 60, 65, 70, 75, 80, 85] }, // Average production for Cow 2
                { name: '6613', data: [40, 45, 50, 55, 60, 65, 70, 75, 80] }, // Average production for Cow 3
                { name: '6629', data: [55, 60, 65, 70, 75, 80, 85, 90, 95] }, // Average production for Cow 4
              ],
            }}
            style={{ height: '510px' }}
          />
        </Grid>


        <Grid xs={12} md={6} lg={8}>
          {/* <AnalyticsConversionRates
            title="Cow Health Metrics"
            subheader="Body Temperature and Respiratory Rate"
            chart={{
              categories: ['Cow 1', 'Cow 2', 'Cow 3', 'Cow 4', 'Cow 5'], // Update with actual cow identifiers or names
              series: [
                { name: 'Body Temperature (°F)', data: [101.5, 102.3, 100.8, 101.0, 102.0] }, // Example body temperature data
                { name: 'Respiratory Rate (breaths/min)', data: [20, 25, 22, 18, 23] }, // Example respiratory rate data
              ],
            }}
          /> */}
            <AnalyticsConversionRates
              title="Cow Health Metrics"
              subheader="Body Temperature and Respiratory Rate"
              chart={{
                // categories: ['6612', '6613', '6621', '6629', '6601', '6610'], // cow IDs as strings
                // categories: healthChartData.categories,
                categories: healthChartData.categories?.map(String),
                series: healthChartData.series, // Ensure data is correctly structured
              }}
            />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {/* <AnalyticsCurrentSubject
            title="Daily Cow Activity Breakdown"
            chart={{
              categories: [
                'Eating',
                'Sleeping',
                'Ruminating',
              ],
              series: [
                { name: 'Cow A', data: [180, 320, 120] },  // Values in minutes
                { name: 'Cow B', data: [110, 260, 200] },
                { name: 'Cow C', data: [90, 350, 160] },
              ],
            }}
          /> */}
          {/* <AnalyticsWebsiteVisitsLineChart
                  title="Average Ruminating Time per Cow"
                  subheader="Duration in minutes over the week"
                  chart={{
                    categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                    series: [
                      { name: 'Cow A', data: [180, 200, 220, 190, 210, 230, 250] },
                      { name: 'Cow B', data: [160, 170, 180, 175, 185, 195, 205] },
                      { name: 'Cow C', data: [200, 210, 220, 240, 230, 250, 260] },
                    ],
                  }}
                  tooltipLabel="minutes"
                />
               <AnalyticsWebsiteVisitsLineChart
              title="Average Ruminating Time per Cow"
              subheader="Duration in minutes over the week"
              chart={}
              tooltipLabel="minutes"
            /> */}
          <Grid xs={12} md={6} lg={8}>
                <AnalyticsWebsiteVisitsLineChart
                  title="Average Ruminating Time per Cow"
                  subheader="Duration in minutes over the week"
                  chart={{
                    categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                    series: [
                      { name: '6612', data: [180, 200, 220, 190, 210, 230, 250] },
                      { name: '6613', data: [160, 170, 180, 175, 185, 195, 205] },
                      { name: '6621', data: [200, 210, 220, 240, 230, 250, 260] },
                      { name: '6601', data: [180, 225, 150, 200, 130, 165, 245] },
                    ],
                  }}
                  tooltipLabel="minutes"
                />
              </Grid>
        </Grid>
<Grid xs={12} md={4} lg={12}>
            <AnalyticsTasks title="Tasks" list={_tasks} />
          </Grid>
        </Grid>
      </DashboardContent>
    </>
  );
}