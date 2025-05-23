'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function NewCaseStudyPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the case study edit page with "new" as the ID
    router.push('/dashboard/case-studies/new');
  }, [router]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="body1">Redirecting to case study form...</Typography>
    </Box>
  );
}
