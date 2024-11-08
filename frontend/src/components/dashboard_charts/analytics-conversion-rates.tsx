import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

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
};

export function AnalyticsConversionRates({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.secondary.dark,
    theme.palette.warning.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    fill: { colors: chartColors },
    stroke: { width: 2, colors: ['transparent'] },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}: ` },
      },
    },
    xaxis: { 
      categories: chart.categories?.map(String),  // Ensure categories are strings
      labels: { style: { colors: '#FFFFFF' } }
    },
    yaxis: {
      labels: { style: { colors: ['#FFFFFF'] } },
    },
    dataLabels: {
      enabled: true,
      offsetX: -6,
      style: { fontSize: '10px', colors: ['#FFFFFF'] },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 2,
        barHeight: '48%',
        dataLabels: { position: 'top' },
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}
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
        height={360}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}
