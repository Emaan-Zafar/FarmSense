import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { CONFIG } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar for notifications
import Alert, { AlertColor } from '@mui/material/Alert'; // Import Alert for success/error messages

// ----------------------------------------------------------------------

const DUMMY_EMAIL = 'hello@gmail.com';
const DUMMY_PASSWORD = '@demo1234';

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('success'); // Set the severity state type

  const handleSignUp = useCallback(() => {
    // Simple validation
    if (!email || !password || !confirmPassword) {
      setErrorMessage('All fields are required.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Dummy authentication check
    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      setSuccessMessage('Successfully signed up!');
      setSeverity('success');
      setOpenSnackbar(true);
      router.push('/sign-in');
    } else {
      setErrorMessage('Email is already in use.');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, [email, password, confirmPassword, router]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessage(''); // Clear error message
    setSuccessMessage(''); // Clear success message
  };

  const renderForm = (
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
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputLabelProps={{ shrink: true }}
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      <TextField
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        InputLabelProps={{ shrink: true }}
        type="password"
        sx={{ mb: 3 }}
      />
      <LoadingButton
        fullWidth
        size="large"
        type="button" // Prevent form submission
        color="inherit"
        variant="contained"
        onClick={handleSignUp}
      >
        Sign up
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>{`Sign Up - ${CONFIG.appName}`}</title>
      </Helmet>

      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign Up</Typography>
        <Typography variant="body2" color="text.secondary">
          Already have an account?
          <Link variant="subtitle2" sx={{ ml: 0.5 }} onClick={() => router.push('/sign-in')}>
            Sign in
          </Link>
        </Typography>
      </Box>

      {renderForm}

      {/* Snackbar for displaying success/error messages */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity} sx={{ width: '100%' }}>
          {errorMessage || successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
