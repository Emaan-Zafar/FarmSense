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

import React, { useEffect, useState } from 'react';
import axios from 'axios';
// ----------------------------------------------------------------------

interface CattleRecord {
  Age: number;
  // Add other properties if needed (e.g., Id, Sex, etc.)
  [key: string]: any;
}

export default function Page() {
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/catalog');
        const records: CattleRecord[] = response.data; // Assuming API returns an array of records
        const ageDistribution = processAgeData(records);
        setChartData(ageDistribution);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const processAgeData = (data: CattleRecord[]) => {
    const ageCount: { [key: number]: number } = {};  // Object where keys are ages and values are the counts

    data.forEach((record) => {
      const { Age } = record;

      if (ageCount[Age]) {
        ageCount[Age] += 1;
      } else {
        ageCount[Age] = 1;
      }
    });

    // Convert ageCount object to an array of objects for chart rendering
    return Object.keys(ageCount).map((age) => ({
      label: `Age ${age}`,  // Label for each distinct age
      value: ageCount[Number(age)],  // The count of how many times that age appears
    }));
  };
  
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
        <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
          Hi, Welcome back 👋
        </Typography>

        <Grid container spacing={3}>
          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Total Cows"
              // percent={2.6}
              total={4}
              // icon={<img alt="icon" src="/assets/icons/glass/ic-glass-bag.svg" />}
              // chart={{
              //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              //   series: [22, 8, 35, 50, 82, 84, 77, 12],
              // }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Milking Cows"
              // percent={-0.1}
              total={4}
              color="secondary"
              // icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
              // chart={{
              //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              //   series: [56, 47, 40, 62, 73, 30, 23, 54],
              // }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Healthy Cows"
              // percent={2.8}
              total={4}
              color="warning"
              // icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
              // chart={{
              //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              //   series: [40, 70, 50, 28, 70, 75, 7, 64],
              // }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Unhealthy Cows"
              // percent={3.6}
              total={0}
              color="error"
              // icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
              // chart={{
              //   categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              //   series: [56, 30, 23, 54, 47, 40, 62, 73],
              // }}
            />
          </Grid>
          
          <Grid xs={12} md={6} lg={4}>
            <AnalyticsCurrentVisits
              title="Cattle Age Distribution"
              chart={{
                series: chartData,  // Pass the processed chart data
              }}
            />
          </Grid>
          
          <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Average Milk Production"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Cow 1', data: [50, 55, 60, 65, 70, 75, 80, 85, 90] }, // Average production for Cow 1
                { name: 'Cow 2', data: [45, 50, 55, 60, 65, 70, 75, 80, 85] }, // Average production for Cow 2
                { name: 'Cow 3', data: [40, 45, 50, 55, 60, 65, 70, 75, 80] }, // Average production for Cow 3
                { name: 'Cow 4', data: [55, 60, 65, 70, 75, 80, 85, 90, 95] }, // Average production for Cow 4
              ],
            }}
          />
        </Grid>


          {/* <Grid xs={12} md={6} lg={8}>
            <AnalyticsConversionRates
              title="Conversion rates"
              subheader="(+43%) than last year"
              chart={{
                categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
                series: [
                  { name: '2022', data: [44, 55, 41, 64, 22] },
                  { name: '2023', data: [53, 32, 33, 52, 13] },
                ],
              }}
            />
          </Grid> */}

          {/* <Grid xs={12} md={6} lg={4}>
            <AnalyticsCurrentSubject
              title="Current subject"
              chart={{
                categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
                series: [
                  { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                  { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                  { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
                ],
              }}
            />
          </Grid> */}

          {/* <Grid xs={12} md={6} lg={8}>
            <AnalyticsNews title="News" list={_posts.slice(0, 5)} />
          </Grid>

          <Grid xs={12} md={6} lg={4}>
            <AnalyticsOrderTimeline title="Order timeline" list={_timeline} />
          </Grid> */}

          {/* <Grid xs={12} md={6} lg={4}>
            <AnalyticsTrafficBySite
              title="Traffic by site"
              list={[
                { value: 'facebook', label: 'Facebook', total: 323234 },
                { value: 'google', label: 'Google', total: 341212 },
                { value: 'linkedin', label: 'Linkedin', total: 411213 },
                { value: 'twitter', label: 'Twitter', total: 443232 },
              ]}
            />
          </Grid> */}

          {/* <Grid xs={12} md={6} lg={8}>
            <AnalyticsTasks title="Tasks" list={_tasks} />
          </Grid> */}
        </Grid>
      </DashboardContent>
    </>
  );
}
