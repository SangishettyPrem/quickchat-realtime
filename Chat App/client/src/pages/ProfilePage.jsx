import { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Paper,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { UserRound as PersonIcon } from 'lucide-react';
import { Camera as CameraAltIcon } from 'lucide-react';
import assets from '../assets/assets';
import { useDispatch, useSelector } from 'react-redux';
import { handleError, handleSuccess } from '../utils/handleResponse';
import { UpdateProfile } from '../redux/features/authSlice';
import { ImageBaseURL } from '../config/url';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const { user, isUpdateProfileSubmitting } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();

    // Responsive breakpoints
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    const [formData, setformData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        profileImage: user?.profile_image,
        imagePreview: user?.profile_image ? `${ImageBaseURL}${user?.profile_image}` : null
    });

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setformData({
                    ...formData,
                    profileImage: file,
                    imagePreview: e.target.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const form = new FormData();
            if (formData?.profileImage) form.append('profileImage', formData?.profileImage);
            form.append('name', formData.name);
            form.append('bio', formData.bio);
            const result = await dispatch(UpdateProfile({ form, id: user?.id }));
            if (result?.payload?.success) {
                setTimeout(() => {
                    navigate('/home');
                }, 2000);
                return handleSuccess("Updated Successfully");
            } else {
                return handleError(result?.payload?.message || result?.payload || "Failed to Update Profile")
            }
        } catch (error) {
            return handleError(error?.message || "Failed to Save Profile Data");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setformData({
            ...formData,
            [name]: value
        });
    };

    // Responsive styles
    const containerStyles = {
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: {
            xs: 1, // 8px on mobile
            sm: 2, // 16px on tablet
            md: 3  // 24px on desktop
        },
        position: 'relative',
        overflow: 'hidden',
        flexDirection: {
            xs: 'column', // Stack vertically on mobile
            md: 'row'     // Side by side on desktop
        },
        gap: {
            xs: 3, // 24px gap on mobile
            md: 10 // 80px gap on desktop
        }
    };

    const paperStyles = {
        width: '100%',
        maxWidth: {
            xs: '100%',  // Full width on mobile
            sm: 480,     // 480px on tablet and up
            md: 480      // Keep 480px on desktop
        },
        padding: {
            xs: 2, // 16px padding on mobile
            sm: 3, // 24px padding on tablet
            md: 4  // 32px padding on desktop
        },
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        position: 'relative',
        zIndex: 2
    };

    const avatarSize = {
        xs: 56, // 56px on mobile
        sm: 64, // 64px on tablet and up
        md: 72  // 72px on desktop
    };

    const logoSize = {
        xs: 120, // 120px on mobile
        sm: 150, // 150px on tablet
        md: 200  // 200px on desktop
    };

    return (
        <Box sx={containerStyles}>
            <Paper elevation={0} sx={paperStyles}>
                <Typography
                    variant={isMobile ? "h6" : "h5"}
                    sx={{
                        color: 'white',
                        fontWeight: 500,
                        mb: {
                            xs: 3, // 24px margin on mobile
                            md: 4  // 32px margin on desktop
                        },
                        fontFamily: '"Segoe UI", system-ui, sans-serif',
                        textAlign: {
                            xs: 'center', // Center on mobile
                            md: 'left'    // Left align on desktop
                        }
                    }}
                >
                    Profile details
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: {
                            xs: 'column', // Stack vertically on mobile
                            sm: 'row'     // Side by side on tablet and up
                        },
                        gap: {
                            xs: 2, // 16px gap on mobile
                            sm: 2  // 16px gap on tablet and up
                        },
                        mb: 3,
                        textAlign: {
                            xs: 'center', // Center on mobile
                            sm: 'left'    // Left align on tablet and up
                        }
                    }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={formData?.imagePreview}
                            sx={{
                                width: avatarSize,
                                height: avatarSize,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            {!formData?.imagePreview && <PersonIcon />}
                        </Avatar>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="profile-image-upload"
                            type="file"
                            onChange={handleImageUpload}
                        />
                        <label htmlFor="profile-image-upload">
                            <IconButton
                                component="span"
                                sx={{
                                    position: 'absolute',
                                    bottom: -4,
                                    right: -4,
                                    width: {
                                        xs: 20, // 20px on mobile
                                        sm: 24  // 24px on tablet and up
                                    },
                                    height: {
                                        xs: 20, // 20px on mobile
                                        sm: 24  // 24px on tablet and up
                                    },
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#7c3aed'
                                    }
                                }}
                            >
                                <CameraAltIcon sx={{
                                    fontSize: {
                                        xs: 12, // 12px on mobile
                                        sm: 14  // 14px on tablet and up
                                    }
                                }} />
                            </IconButton>
                        </label>
                    </Box>
                    <Typography
                        sx={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: {
                                xs: '0.875rem', // 14px on mobile
                                sm: '0.95rem'   // 15.2px on tablet and up
                            },
                            fontFamily: '"Segoe UI", system-ui, sans-serif'
                        }}
                    >
                        upload profile image
                    </Typography>
                </Box>

                {/* Name Input */}
                <TextField
                    fullWidth
                    name='name'
                    label="Name"
                    value={formData.name}
                    onChange={handleChange}
                    sx={{
                        mb: 3,
                        '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: {
                                xs: '0.875rem', // 14px on mobile
                                sm: '1rem'      // 16px on tablet and up
                            }
                        },
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            color: 'white',
                            fontSize: {
                                xs: '0.875rem', // 14px on mobile
                                sm: '1rem'      // 16px on tablet and up
                            },
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                borderWidth: 1
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#8b5cf6',
                                borderWidth: 2
                            }
                        },
                        '& .MuiInputBase-input': {
                            padding: {
                                xs: '12px 14px', // Smaller padding on mobile
                                sm: '14px 16px'  // Default padding on tablet and up
                            }
                        }
                    }}
                />

                {/* Bio Input */}
                <TextField
                    fullWidth
                    multiline
                    rows={isMobile ? 3 : 4} // Fewer rows on mobile
                    name='bio'
                    label="Bio"
                    value={formData.bio}
                    onChange={handleChange}
                    sx={{
                        mb: 4,
                        '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: {
                                xs: '0.875rem', // 14px on mobile
                                sm: '1rem'      // 16px on tablet and up
                            }
                        },
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            color: 'white',
                            fontSize: {
                                xs: '0.875rem', // 14px on mobile
                                sm: '1rem'      // 16px on tablet and up
                            },
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                borderWidth: 1
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#8b5cf6',
                                borderWidth: 2
                            }
                        },
                        '& .MuiInputBase-input': {
                            padding: {
                                xs: '12px 14px', // Smaller padding on mobile
                                sm: '14px 16px'  // Default padding on tablet and up
                            }
                        }
                    }}
                />

                {/* Save Button */}
                <Button
                    fullWidth
                    onClick={handleSave}
                    disabled={isUpdateProfileSubmitting}
                    sx={{
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        py: {
                            xs: 1.5, // 12px padding on mobile
                            sm: 2    // 16px padding on tablet and up
                        },
                        borderRadius: 25,
                        fontSize: {
                            xs: '1rem',   // 16px on mobile
                            sm: '1.1rem'  // 17.6px on tablet and up
                        },
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                        '&:hover': {
                            backgroundColor: '#7c3aed',
                            boxShadow: '0 12px 32px rgba(139, 92, 246, 0.5)'
                        },
                        '&:active': {
                            transform: 'translateY(1px)'
                        },
                        '&:disabled': {
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        fontFamily: '"Segoe UI", system-ui, sans-serif'
                    }}
                >
                    {isUpdateProfileSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </Paper>

            {/* Logo Section */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    order: {
                        xs: -1, // Show logo first on mobile
                        md: 1   // Show logo after form on desktop
                    }
                }}
            >
                <img
                    src={assets.logo_icon}
                    alt="Logo Icon"
                    style={{
                        width: isMobile ? logoSize.xs : isTablet ? logoSize.sm : logoSize.md,
                        height: isMobile ? logoSize.xs : isTablet ? logoSize.sm : logoSize.md,
                        maxWidth: '100%',
                        height: 'auto'
                    }}
                />
            </Box>

            <ToastContainer
                position={isMobile ? "top-center" : "top-right"}
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{
                    fontSize: isMobile ? '14px' : '16px'
                }}
            />
        </Box>
    );
};

export default ProfilePage;