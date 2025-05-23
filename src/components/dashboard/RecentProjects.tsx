import * as React from 'react';
import Link from 'next/link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import { Button, Chip, Paper } from '@mui/material';

// Generate Project Data
function createData(
  id: number,
  name: string,
  client: string,
  startDate: string,
  endDate: string,
  status: string,
  team: number
) {
  return { id, name, client, startDate, endDate, status, team };
}

const rows = [
  createData(
    0,
    'Website Redesign',
    'Acme Corporation',
    '01/15/2025',
    '05/30/2025',
    'in-progress',
    6
  ),
  createData(
    1,
    'Strategic Market Analysis',
    'Global Industries',
    '02/10/2025',
    '03/15/2025',
    'completed',
    4
  ),
  createData(
    2,
    'IT Infrastructure Upgrade',
    'Tech Solutions Inc',
    '03/01/2025',
    '08/30/2025',
    'planning',
    8
  ),
  createData(
    3,
    'Customer Acquisition Strategy',
    'Retail Partners',
    '04/01/2025',
    '06/15/2025',
    'in-progress',
    3
  ),
  createData(
    4,
    'Financial Consulting Services',
    'StarBank Group',
    '05/10/2025',
    '07/30/2025',
    'on-hold',
    5
  ),
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning':
      return 'info';
    case 'in-progress':
      return 'primary';
    case 'on-hold':
      return 'warning';
    case 'completed':
      return 'success';
    case 'canceled':
      return 'error';
    default:
      return 'default';
  }
};

export default function RecentProjects() {
  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Title>Recent Projects</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Project Name</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Team Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.client}</TableCell>
              <TableCell>{row.startDate}</TableCell>
              <TableCell>{row.endDate}</TableCell>
              <TableCell>
                <Chip
                  label={row.status}
                  color={getStatusColor(row.status) as any}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell align="right">{row.team}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Link href="/dashboard/projects" passHref>
        <Button sx={{ mt: 3, alignSelf: 'flex-end' }} component="a">
          See all projects
        </Button>
      </Link>
    </Paper>
  );
}
