import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CaseIcon from '@mui/icons-material/WorkOutline';
import ArticleIcon from '@mui/icons-material/Article';
import WorkIcon from '@mui/icons-material/Work';
import MarketingIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import Link from 'next/link';

export const mainListItems = (
  <React.Fragment>
    <Link href="/dashboard" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
    </Link>
    <Link href="/dashboard/users" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Users" />
      </ListItemButton>
    </Link>
    <Link href="/dashboard/organizations" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <BusinessIcon />
        </ListItemIcon>
        <ListItemText primary="Organizations" />
      </ListItemButton>
    </Link>
    <Link href="/dashboard/projects" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Projects" />
      </ListItemButton>
    </Link>
    <Link href="/dashboard/case-studies" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <CaseIcon />
        </ListItemIcon>
        <ListItemText primary="Case Studies" />
      </ListItemButton>
    </Link>
    <Link href="/dashboard/blog" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <ArticleIcon />
        </ListItemIcon>
        <ListItemText primary="Blog" />
      </ListItemButton>
    </Link>
    <Link href="/dashboard/ats" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <WorkIcon />
        </ListItemIcon>
        <ListItemText primary="ATS" />
      </ListItemButton>
    </Link>
    <Link href="/dashboard/marketing" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <MarketingIcon />
        </ListItemIcon>
        <ListItemText primary="Marketing" />
      </ListItemButton>
    </Link>
  </React.Fragment>
);

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Account
    </ListSubheader>
    <Link href="/dashboard/settings" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItemButton>
    </Link>
    <Link href="/dashboard/help" passHref>
      <ListItemButton component="a">
        <ListItemIcon>
          <HelpIcon />
        </ListItemIcon>
        <ListItemText primary="Help & Support" />
      </ListItemButton>
    </Link>
  </React.Fragment>
);
