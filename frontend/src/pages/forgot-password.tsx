import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar for notifications
import Alert, { AlertColor } from '@mui/material/Alert'; // Import Alert for success/error messages
import { CONFIG } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('success'); // Set the severity state type

  const handleResetPassword = useCallback(() => {
    // Add password reset logic here
    if (email === '' || confirmEmail === '' || newPassword === '' || confirmPassword === '') {
      setErrorMessage('All fields are required.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (email !== confirmEmail) {
      setErrorMessage('Emails do not match.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    console.log("Password reset successful for", email);
    setSuccessMessage('Password reset successful!');
    setSeverity('success');
    setOpenSnackbar(true);
    // Optionally redirect to sign-in page
    router.push('/sign-in');
  }, [email, confirmEmail, newPassword, confirmPassword, router]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessage(''); // Clear error message
    setSuccessMessage(''); // Clear success message
  };

  return (
    <>
      <Helmet>
        <title>{`Forgot Password - ${CONFIG.appName}`}</title>
      </Helmet>

      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Forgot Password</Typography>
        <Typography variant="body2" color="text.secondary">
          Remember your password? 
          <Link variant="subtitle2" sx={{ ml: 0.5 }} onClick={() => router.push('/sign-in')}>
            Sign in
          </Link>
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <TextField
          fullWidth
          name="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />
        
        <TextField
          fullWidth
          name="confirmEmail"
          label="Confirm Email address"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          name="newPassword"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="button" // Prevent form submission
          color="inherit"
          variant="contained"
          onClick={handleResetPassword}
        >
          Reset Password
        </LoadingButton>
      </Box>

      {/* Snackbar for displaying success/error messages */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity} sx={{ width: '100%' }}>
          {errorMessage || successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
