import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
  tooltipLabel?: string; // Corrected: define as optional string
};

export function AnalyticsWebsiteVisitsLineChart({
  title,
  subheader,
  chart,
  tooltipLabel, // Default value for tooltipLabel
  ...other
}: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.lighter,
    theme.palette.warning.main,
    theme.palette.secondary.dark,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 2,
      curve: 'smooth', // Smooth curve for the line chart
      colors: chartColors, // Set colors for the line
    },
    xaxis: {
      categories: chart.categories,
      labels: { style: { colors: '#FFFFFF' } }
    },
    yaxis: {
      labels: { style: { colors: ['#FFFFFF'] } }, // White y-axis label color
    },
    legend: {
      show: true,
      labels: {
        colors: '#FFFFFF', // Set legend text color to white
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value: number) => `${value} ${tooltipLabel}`, // Using tooltipLabel here
      },
    },
    ...chart.options,
  });

  return (
    <Card
      {...other}
      sx={{
        backgroundColor: '#233a4a', // Semi-transparent background
        boxShadow: theme.shadows[10], // Retain shadow
        borderRadius: '16px', // Optional: rounded corners
      }}
    >
       <CardHeader 
  title={title}
  subheader={subheader}
  sx={{
    "& .MuiCardHeader-title": {
      color: "#FFFFFF", // Set title color to white
    },
    "& .MuiCardHeader-subheader": {
      color: "#FFFFFF", // Set subheader color to white
    },
  }}
/>

      <Chart
        type="line" // Change to 'line' for line chart
        series={chart.series}
        options={chartOptions}
        height={364}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
