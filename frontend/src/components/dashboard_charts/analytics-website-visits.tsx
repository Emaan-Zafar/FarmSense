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

export function AnalyticsWebsiteVisits({
  title,
  subheader,
  chart,
  tooltipLabel, // Default value for tooltipLabel
  ...other
}: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.secondary.dark,
    theme.palette.error.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: chart.categories,
      labels: {
        style: { colors: '#FFFFFF' }, // Set x-axis labels color to white
      },
      
    },
    yaxis: {
      labels: {
        style: { colors: '#FFFFFF' }, // Set y-axis labels color to white
      },
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
        type="bar"
        series={chart.series}
        options={chartOptions}
        height={364}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
