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
import axios from 'axios'; // Import axios for HTTP requests

// ----------------------------------------------------------------------
export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // Add username input
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('success'); // Set the severity state type

  const validatePassword = (inputPassword: string): string | null => {
    // Example restrictions
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(inputPassword);
    const hasLowerCase = /[a-z]/.test(inputPassword);
    const hasNumber = /\d/.test(inputPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(inputPassword);
  
    if (inputPassword.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
      return 'Password must include at least one uppercase letter.';
    }
    if (!hasLowerCase) {
      return 'Password must include at least one lowercase letter.';
    }
    if (!hasNumber) {
      return 'Password must include at least one number.';
    }
    if (!hasSpecialChar) {
      return 'Password must include at least one special character.';
    }
    return null; // Valid password
  };
  
  const handleSignUp = useCallback(async () => {
    // Simple validation
    if (!email || !password || !confirmPassword || !username) {
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
  
    // Validate password restrictions
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    try {
      // Send the data to the backend API
      const response = await axios.post('http://localhost:4000/api/users/signup', {
        username,
        email,
        password,
      });
  
      setSuccessMessage(response.data.message);
      setSeverity('success');
      setOpenSnackbar(true);
      router.push('/sign-in'); // Redirect to sign-in page after successful sign-up
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error occurred');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  }, [email, password, confirmPassword, username, router]);

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
