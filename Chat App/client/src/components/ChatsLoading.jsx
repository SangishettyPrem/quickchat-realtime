import React from 'react';
import {
    Box,
    Skeleton,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar
} from '@mui/material';

const ChatsLoading = () => {
    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 1200,
                    height: '80vh',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex'
                }}
            >
                {/* Left Sidebar Loading */}
                <Box
                    sx={{
                        width: 320,
                        background: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header Loading */}
                    <Box
                        sx={{
                            p: 3,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Skeleton
                                variant="rectangular"
                                width={32}
                                height={32}
                                sx={{ borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                            />
                            <Skeleton
                                variant="text"
                                width={120}
                                height={32}
                                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                            />
                        </Box>
                        <Skeleton
                            variant="circular"
                            width={24}
                            height={24}
                            sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                        />
                    </Box>

                    {/* Search Loading */}
                    <Box sx={{ p: 3, pb: 2 }}>
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={40}
                            sx={{ borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                        />
                    </Box>

                    {/* Contacts List Loading */}
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        <List sx={{ p: 0 }}>
                            {[1, 2, 3, 4, 5].map((index) => (
                                <ListItem key={index} sx={{ px: 3, py: 2 }}>
                                    <ListItemAvatar>
                                        <Skeleton
                                            variant="circular"
                                            width={48}
                                            height={48}
                                            sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Skeleton
                                                variant="text"
                                                width="70%"
                                                height={20}
                                                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mb: 1 }}
                                            />
                                        }
                                        secondary={
                                            <Skeleton
                                                variant="text"
                                                width="40%"
                                                height={16}
                                                sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }}
                                            />
                                        }
                                    />
                                    {index > 3 && (
                                        <Skeleton
                                            variant="circular"
                                            width={24}
                                            height={24}
                                            sx={{ bgcolor: 'rgba(139, 92, 246, 0.3)' }}
                                        />
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>

                {/* Main Chat Area Loading */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        background: 'rgba(255, 255, 255, 0.02)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background decoration */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '20%',
                            right: '20%',
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                            filter: 'blur(60px)'
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '20%',
                            left: '20%',
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
                            filter: 'blur(40px)'
                        }}
                    />

                    {/* Loading spinner and text */}
                    <CircularProgress
                        size={60}
                        thickness={4}
                        sx={{
                            color: '#8b5cf6',
                            mb: 3,
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round'
                            }
                        }}
                    />

                    <Typography
                        variant="h5"
                        sx={{
                            color: 'white',
                            fontWeight: 500,
                            textAlign: 'center',
                            fontFamily: '"Segoe UI", system-ui, sans-serif',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                            mb: 1
                        }}
                    >
                        Loading QuickChat...
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            textAlign: 'center',
                            fontFamily: '"Segoe UI", system-ui, sans-serif'
                        }}
                    >
                        Please wait while we prepare your conversations
                    </Typography>

                    {/* Animated pulse dots */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            mt: 2,
                            '& > div': {
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#8b5cf6',
                                animation: 'pulse 1.5s ease-in-out infinite'
                            },
                            '& > div:nth-of-type(2)': {
                                animationDelay: '0.2s'
                            },
                            '& > div:nth-of-type(3)': {
                                animationDelay: '0.4s'
                            },
                            '@keyframes pulse': {
                                '0%, 80%, 100%': {
                                    opacity: 0.3,
                                    transform: 'scale(1)'
                                },
                                '40%': {
                                    opacity: 1,
                                    transform: 'scale(1.2)'
                                }
                            }
                        }}
                    >
                        <Box />
                        <Box />
                        <Box />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatsLoading;