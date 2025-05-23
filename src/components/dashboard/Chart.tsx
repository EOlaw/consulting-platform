import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from 'recharts';
import Title from './Title';
import { Paper } from '@mui/material';

// Generate Sales Data
function createData(time: string, amount?: number) {
  return { time, amount };
}

const data = [
  createData('Jan', 0),
  createData('Feb', 300),
  createData('Mar', 600),
  createData('Apr', 800),
  createData('May', 1500),
  createData('Jun', 2000),
  createData('Jul', 2400),
  createData('Aug', 2400),
  createData('Sep', 3000),
  createData('Oct', 3500),
  createData('Nov', 4000),
  createData('Dec', 4500),
];

export default function Chart() {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 365,
      }}
    >
      <Title>Monthly Revenue</Title>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 16,
            right: 16,
            bottom: 24,
            left: 24,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            style={theme.typography.body2}
          >
            <Label
              angle={270}
              position="left"
              style={{
                textAnchor: 'middle',
                fill: theme.palette.text.primary,
                ...theme.typography.body1,
              }}
            >
              Revenue ($)
            </Label>
          </YAxis>
          <Tooltip />
          <Legend />
          <Line
            isAnimationActive={false}
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
