import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  Container
} from '@mui/material';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { handleError, handleSuccess } from '../utils/handleResponse';
import { SignUp, UserLogin } from '../redux/features/authSlice';
import { ToastContainer } from 'react-toastify';

const Login = () => {
  const [isLogin, setisLogin] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleLogin = async (e) => {
    try {
      const result = await dispatch(UserLogin(formData));
      if (result?.payload?.success) {
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      } else {
        return handleError(result?.payload?.message);
      }
    } catch (error) {
      return handleError(error?.message || "Error while Signup");
    }
  }
  const handleSignup = async (e) => {
    if (!agreedToTerms) {
      alert('Please agree to the terms of use & privacy policy');
      return;
    }
    try {
      const result = await dispatch(SignUp(formData));
      if (result?.payload?.success) {
        setTimeout(() => { setisLogin(prev => !prev); }, 1000);
        setFormData({ name: '', email: '', password: '' });
        handleSuccess(result?.payload?.message);
      } else {
        return handleError(result?.payload?.message);
      }
    } catch (error) {
      return handleError(error?.message || "Error while Signup");
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = () => {
    setisLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setAgreedToTerms(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: { xs: "center", md: "space-around" },
          alignItems: "center",
          minHeight: "100vh",
          width: { xs: "95vw", sm: "90vw", md: "80vw", lg: "65vw" },
          margin: "0px auto",
          padding: { xs: 2, sm: 3, md: 4 },
          gap: { xs: 4, md: 8 },
          backgroundColor: "#000",
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: { xs: "100%", md: "auto" }
          }}
        >
          <Box
            component="img"
            src={assets.logo_big}
            alt="Logo"
            sx={{
              height: "auto",
              width: "100%",
              maxWidth: {
                xs: "200px",
                sm: "250px",
                md: "300px",
                lg: "400px"
              },
              objectFit: "contain"
            }}
          />
        </Box>

        {/* Form Section */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid white',
            padding: { xs: "20px 30px", sm: "25px 40px", md: "30px 50px" },
            borderRadius: "10px",
            backgroundColor: "transparent",
            width: { xs: "100%", sm: "auto" },
            minWidth: { sm: "400px" }
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: "white",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: "bold",
                marginBottom: { xs: 3, sm: 4 },
                textAlign: { xs: "center", md: "left" }
              }}
            >
              {isLogin ? "Login" : "Sign up"}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>
              {/* Name Input - Only for Signup */}
              {!isLogin && (
                <TextField
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'transparent',
                      color: 'white',
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      '& fieldset': {
                        borderColor: '#6b7280',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#a855f7',
                        borderWidth: '1px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: { xs: '10px 12px', sm: '12px 16px' },
                      '&::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                      },
                    },
                  }}
                />
              )}

              {/* Email Input */}
              <TextField
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& fieldset': {
                      borderColor: '#6b7280',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#a855f7',
                      borderWidth: '1px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: { xs: '10px 12px', sm: '12px 16px' },
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    },
                  },
                }}
              />

              {/* Password Input */}
              <TextField
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                autoComplete="current-password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& fieldset': {
                      borderColor: '#6b7280',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#a855f7',
                      borderWidth: '1px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: { xs: '10px 12px', sm: '12px 16px' },
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    },
                  },
                }}
              />

              <Button
                disabled={isLoading}
                loading={isLoading}
                variant="contained"
                fullWidth
                type="submit"
                sx={{
                  marginBottom: '10px',
                  padding: { xs: '8px 16px', sm: '10px 20px' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  backgroundColor: '#6366f1',
                  '&:hover': {
                    backgroundColor: '#5856eb',
                  },
                  '&:disabled': {
                    backgroundColor: '#374151',
                  },
                }}
              >
                {isLoading ? 'Loading...' : (isLogin ? "Login" : "Create Account")}
              </Button>

              {!isLogin && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      sx={{
                        color: '#6b7280',
                        padding: '0 8px 0 0',
                        '&.Mui-checked': {
                          color: '#a855f7',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        color: '#9ca3af',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        lineHeight: 1.25,
                      }}
                    >
                      Agree to the terms of use & privacy policy.
                    </Typography>
                  }
                  sx={{
                    alignItems: 'flex-start',
                    margin: 0,
                  }}
                />
              )}
            </Box>

            <Box sx={{ marginTop: { xs: 2, sm: 3 }, textAlign: "center" }}>
              <Typography
                component="span"
                sx={{
                  color: '#9ca3af',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Typography>
              <Typography
                component="span"
                onClick={handleChange}
                sx={{
                  color: '#a855f7',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#c084fc',
                    textDecoration: 'underline',
                  },
                  marginLeft: '4px',
                }}
              >
                {isLogin ? "Sign up here" : "Login here"}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      <ToastContainer />
    </Container>
  );
}

export default Login;
