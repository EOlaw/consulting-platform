import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface SocialShareProps {
  title: string;
  url: string;
  variant?: 'vertical' | 'horizontal';
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SocialShare: React.FC<SocialShareProps> = ({
  title,
  url,
  variant = 'horizontal',
  showLabel = true,
  size = 'medium'
}) => {
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: ''
  });

  // Use the current URL if none is provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard!'
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Size configurations
  const iconSizes = {
    small: {
      buttonSize: 30,
      iconSize: 18
    },
    medium: {
      buttonSize: 40,
      iconSize: 24
    },
    large: {
      buttonSize: 50,
      iconSize: 28
    }
  };

  const { buttonSize, iconSize } = iconSizes[size];

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: variant === 'vertical' ? 'column' : 'row',
          alignItems: 'center',
          gap: variant === 'vertical' ? 1 : 2
        }}
      >
        {showLabel && (
          <Typography
            variant="subtitle2"
            component="span"
            sx={{
              mr: variant === 'vertical' ? 0 : 1,
              mb: variant === 'vertical' ? 1 : 0,
              color: 'text.secondary',
              fontWeight: 'medium'
            }}
          >
            Share:
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: variant === 'vertical' ? 'column' : 'row',
            gap: 1
          }}
        >
          <Tooltip title="Share on Facebook">
            <IconButton
              onClick={shareFacebook}
              color="primary"
              sx={{
                width: buttonSize,
                height: buttonSize,
                '& svg': { fontSize: iconSize }
              }}
            >
              <FacebookIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share on Twitter">
            <IconButton
              onClick={shareTwitter}
              color="primary"
              sx={{
                width: buttonSize,
                height: buttonSize,
                '& svg': { fontSize: iconSize }
              }}
            >
              <TwitterIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share on LinkedIn">
            <IconButton
              onClick={shareLinkedIn}
              color="primary"
              sx={{
                width: buttonSize,
                height: buttonSize,
                '& svg': { fontSize: iconSize }
              }}
            >
              <LinkedInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share via Email">
            <IconButton
              onClick={shareEmail}
              color="primary"
              sx={{
                width: buttonSize,
                height: buttonSize,
                '& svg': { fontSize: iconSize }
              }}
            >
              <EmailIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Copy Link">
            <IconButton
              onClick={copyLink}
              color="primary"
              sx={{
                width: buttonSize,
                height: buttonSize,
                '& svg': { fontSize: iconSize }
              }}
            >
              <LinkIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SocialShare;
