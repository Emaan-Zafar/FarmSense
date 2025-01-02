import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';
import { CONFIG } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('success');

  const handleSignIn = useCallback(async () => {
    if (!username || !password) {
      setErrorMessage('Username and password are required.');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data?.message || 'Successfully signed in!');
        setSeverity('success');
        setOpenSnackbar(true);
        router.push('/dashboard');
      } else {
        setErrorMessage(data?.message || 'Sign in failed. Please try again.');
        setSeverity('error');
        setOpenSnackbar(true);
      }
    } catch {
      setErrorMessage('An error occurred while signing in. Please try again.');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, [username, password, router]);

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

      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <TextField
          fullWidth
          name="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          type="button"
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

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={severity} sx={{ width: '100%' }}>
          {errorMessage || successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
