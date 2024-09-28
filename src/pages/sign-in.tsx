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

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('success'); // Set the severity state type

  const handleSignIn = useCallback(() => {
    // Simple validation
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Dummy authentication check
    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      setSuccessMessage('Successfully signed in!');
      setSeverity('success');
      setOpenSnackbar(true);
      router.push('/dashboard');
    } else {
      setErrorMessage('Invalid email or password.');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, [email, password, router]);

  const handleForgotPassword = useCallback(() => {
    if (!email) {
      setErrorMessage('Please enter your email to reset your password.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Add logic for password reset here
    setSuccessMessage('A password reset link has been sent to your email.');
    setSeverity('success');
    setOpenSnackbar(true);
    setEmail('');
  }, [email]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessage(''); // Clear error message
    setSuccessMessage(''); // Clear success message
  };

  const renderForm = () => {
    if (isForgotPassword) {
      return (
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
          <LoadingButton
            fullWidth
            size="large"
            type="button" // Prevent form submission
            color="inherit"
            variant="contained"
            onClick={handleForgotPassword}
          >
            Reset Password
          </LoadingButton>
        </Box>
      );
    }

    return (
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
        <LoadingButton
          fullWidth
          size="large"
          type="button" // Prevent form submission
          color="inherit"
          variant="contained"
          onClick={handleSignIn}
        >
          Sign in
        </LoadingButton>
        <Link variant="body2" color="inherit" sx={{ mb: 1.5 }} onClick={() => setIsForgotPassword(true)}>
          Forgot password?
        </Link>
      </Box>
    );
  };

  return (
    <>
      <Helmet>
        <title>{`Sign in - ${CONFIG.appName}`}</title>
      </Helmet>

      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">{isForgotPassword ? 'Reset Password' : 'Sign in'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {isForgotPassword ? (
            <>
              Remembered your password?
              <Link variant="subtitle2" sx={{ ml: 0.5 }} onClick={() => setIsForgotPassword(false)}>
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don’t have an account?
              <Link variant="subtitle2" sx={{ ml: 0.5 }} onClick={() => router.push('/sign-up')}>
                Get started
              </Link>
            </>
          )}
        </Typography>
      </Box>

      {renderForm()}

      {/* Snackbar for displaying success/error messages */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={severity} sx={{ width: '100%' }}>
          {errorMessage || successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
