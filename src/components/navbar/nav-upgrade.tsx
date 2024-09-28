import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import CircularProgress from '@mui/material/CircularProgress';
import { textGradient } from 'src/theme/styles';
// import axios from 'axios';
import { StackProps } from '@mui/material/Stack'; // Import StackProps

// Define the props for AI Pop-up
interface CowData {
  heartRate: number;
  temperature: number;
  activity: string;
}

export function NavUpgrade({ sx, ...other }: StackProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Define dummy cow data using useMemo
  const cowData = useMemo<CowData>(() => ({
    heartRate: 90,
    temperature: 101.5,
    activity: 'low',
  }), []);

  // // Fetch AI suggestions from the backend
  // const fetchAISuggestions = useCallback(async () => {
  //   setLoading(true);
    
  //   try {
  //     const response = await axios.post('http://localhost:5000/get-ai-suggestions', { cowData });
  //     setAiSuggestion(response.data.suggestion);
  //   } catch (error) {
  //     console.error('Error fetching AI suggestions:', error);
  //     setAiSuggestion('Error fetching AI suggestions');
  //   }
    
  //   setLoading(false);
  // }, [cowData]);

  // // Handle AI Button Click to open pop-up
  // const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
  //   setOpenPopover(event.currentTarget);
  //   fetchAISuggestions();
  // }, [fetchAISuggestions]);

  // // Close popover
  // const handleClosePopover = useCallback(() => {
  //   setOpenPopover(null);
  // }, []);

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      sx={{ mb: 4, textAlign: 'center', ...sx }}
      {...other}
    >
      <Typography
        variant="h6"
        sx={(theme) => ({
          ...textGradient(`to right, ${theme.vars.palette.secondary.main}, ${theme.vars.palette.warning.main}`)
        })}
      >
        Need Suggestions?
      </Typography>

      <Box
        component="img"
        alt="Minimal dashboard"
        src="/assets/illustrations/illustration.png"
        sx={{ width: 200, my: 2 }}
      />

      {/* "Try our AI" Button */}
      <Button 
      // onClick={handleOpenPopover} 
      variant="contained" color="inherit">
        Try our AI
      </Button>

      {/* Popover Logic for AI Suggestions */}
      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        // onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="h6" gutterBottom>
            AI Health Suggestions
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Typography variant="body1">{aiSuggestion || 'Fetching suggestions...'}</Typography>
          )}
        </Box>
      </Popover>
    </Box>
  );
}
