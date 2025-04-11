import React, { useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../hooks/useAuth';

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

interface ConversionProgressProps {
  progress: number;
  jobId: string;
  onCancel?: () => void;
}

export const ConversionProgress: React.FC<ConversionProgressProps> = ({ 
  progress, 
  jobId,
  onCancel 
}) => {
  const { token } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!jobId || !token) return;
    
    try {
      setIsCancelling(true);
      setCancelError(null);
      
      const response = await fetch(`/api/jobs/cancel/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel job');
      }
      
      // Call the onCancel callback if provided
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      setCancelError(error instanceof Error ? error.message : 'Failed to cancel job');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <ProgressContainer>
      <StyledCircularProgress 
        variant="determinate" 
        value={progress} 
        size={60} 
        thickness={4} 
      />
      <Typography variant="h6" gutterBottom>
        Converting your files...
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {progress}% complete
      </Typography>
      
      {jobId && (
        <ActionButton
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Conversion'}
        </ActionButton>
      )}
      
      {cancelError && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {cancelError}
        </Typography>
      )}
    </ProgressContainer>
  );
}; 