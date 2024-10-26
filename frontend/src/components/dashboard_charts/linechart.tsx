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
    theme.palette.primary.dark,
    hexAlpha(theme.palette.primary.light, 0.64),
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
    },
    legend: {
      show: true,
    },
    tooltip: {
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
        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent background
        backdropFilter: 'blur(10px)', // Apply blur effect
        boxShadow: theme.shadows[3], // Retain shadow
        borderRadius: '16px', // Optional: rounded corners
      }}
    >
      <CardHeader title={title} subheader={subheader} />

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
