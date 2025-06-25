import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Logout } from "../redux/features/authSlice";
import { handleError } from "../utils/handleResponse";
import ChatsLoading from "../components/ChatsLoading"
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Badge,
    IconButton,
    Paper,
    Chip,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    AppBar,
    Toolbar
} from '@mui/material';
import { Search as SearchIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { EllipsisVertical as MoreVertIcon } from 'lucide-react';
import assets from '../assets/assets';
import { fetchUsers, setUsers } from '../redux/features/ChatSlice';
import { ImageBaseURL } from '../config/url';
import Media from '../components/Media';
import ChatsSection from '../components/ChatsSection';
import socket from '../config/socket';

const HomePage = () => {
    const dispatch = useDispatch();
    const { isChatLoading, users } = useSelector(state => state.chats);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [liveUnreadCounts, setLiveUnreadCounts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [SelectedUser, setSelectedUser] = useState(null);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showMediaPanel, setShowMediaPanel] = useState(false);
    const [mobileView, setMobileView] = useState('contacts'); // 'contacts', 'chat', 'media'
    const open = Boolean(anchorEl);

    useEffect(() => {
        if (!users) {
            dispatch(fetchUsers());
        }
    }, [dispatch]);

    useEffect(() => {
        socket.on('update-online-users', (ids) => {
            setOnlineUserIds(ids);
        });

        return () => {
            socket.off('update-online-users');
        };
    }, []);

    useEffect(() => {
        socket.on('update-unread-count', (counts) => {
            setLiveUnreadCounts(counts);
        });

        return () => {
            socket.off('update-unread-count');
        };
    }, []);

    useEffect(() => {
        if (users && users.length > 0 && onlineUserIds.length > 0) {
            const updatedUsers = users.map(user => ({
                ...user,
                isOnline: onlineUserIds.includes(user.id)
            }));
            setOnlineUsers(updatedUsers);
            dispatch(setUsers(updatedUsers));
        }
    }, [onlineUserIds]);

    useEffect(() => {
        if (user?.id) {
            socket.emit('join', user.id);
        }
    }, [user]);

    useEffect(() => {
        setAnchorEl(null);
    }, [mobileView]);

    const handleClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.currentTarget && event.currentTarget.offsetParent !== null) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        const result = await dispatch(Logout());
        if (result?.payload?.success) {
            navigate('/login');
        } else {
            handleError(result?.payload?.message || "Failed to Login");
        }
    }

    const handleNavigateProfile = () => {
        handleClose();
        navigate('/profile');
    }

    const handleUserSelect = (selectedUser) => {
        setSelectedUser(!SelectedUser ? selectedUser : null);
        if (isMobile) {
            setMobileView('chat');
        }
    };

    const handleBackToContacts = () => {
        if (isMobile) {
            setMobileView('contacts');
            setSelectedUser(null);
        }
    };

    const handleShowMedia = () => {
        if (isMobile) {
            setMobileView('media');
        } else {
            setShowMediaPanel(!showMediaPanel);
        }
    };

    const options = [
        { key: "Edit Profile", handle: handleNavigateProfile },
        { key: "Logout", handle: handleLogout },
    ]

    const filteredUsers = users?.filter(user => user?.name?.toLowerCase().includes(searchQuery?.toLowerCase()))

    // Mobile Header Component
    const MobileHeader = ({ title, showBack = false, onBack, rightAction }) => (
        <AppBar
            position="static"
            sx={{
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <Toolbar sx={{
                minHeight: '56px !important',
                px: 2,
            }}>
                {showBack && (
                    <IconButton
                        edge="start"
                        sx={{ color: 'white', mr: 2 }}
                        onClick={onBack}
                    >
                        <ArrowLeftIcon size={20} />
                    </IconButton>
                )}
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, flex: 1 }}>
                    {title}
                </Typography>
                {rightAction}
            </Toolbar>
        </AppBar>
    );

    // Contacts List Component
    const ContactsList = () => (
        <Box
            sx={{
                height: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {isMobile && (
                <MobileHeader
                    title="QuickChat"
                    rightAction={
                        <IconButton
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            onClick={handleClick}
                            id="mobile-menu-button"
                        >
                            <MoreVertIcon size={20} />
                        </IconButton>
                    }
                />
            )}

            <Box sx={{ p: isMobile ? 2 : 2.5, pb: 0 }}>
                {!isMobile && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box>
                                <img src={assets.logo_icon} height={30} width={30} />
                            </Box>
                            <Typography
                                variant="span"
                                sx={{
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            >
                                QuickChat
                            </Typography>
                        </Box>
                        <IconButton
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            onClick={handleClick}
                            id="desktop-menu-button"
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                )}

                <TextField
                    fullWidth
                    placeholder="Search User..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color='white' size={18} />
                            </InputAdornment>
                        ),
                        sx: {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 10,
                            color: 'white',
                            height: isMobile ? '44px' : '40px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                            },
                            '& input::placeholder': {
                                color: 'rgba(255, 255, 255, 0.6)',
                                opacity: 1
                            }
                        }
                    }}
                />
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', px: isMobile ? 1 : 2.5 }}>
                <List sx={{ p: 0 }}>
                    {filteredUsers?.map((user) => (
                        <ListItem
                            key={user.id}
                            sx={{
                                cursor: 'pointer',
                                padding: isMobile ? '8px' : '12px 8px',
                                borderRadius: 2,
                                mb: 0.5,
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                },
                                transition: 'background-color 0.2s ease'
                            }}
                            onClick={() => handleUserSelect(user)}
                        >
                            <ListItemAvatar sx={{ minWidth: isMobile ? '48px' : '56px' }}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right'
                                    }}
                                    variant="dot"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: user?.isOnline ? '#4ade80' : '#6b7280',
                                            width: isMobile ? 10 : 12,
                                            height: isMobile ? 10 : 12,
                                            borderRadius: '50%',
                                            border: '2px solid rgba(0, 0, 0, 0.3)'
                                        }
                                    }}
                                >
                                    <Avatar
                                        src={ImageBaseURL + user?.profile_image}
                                        sx={{
                                            width: isMobile ? 40 : 44,
                                            height: isMobile ? 40 : 44,
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        }}
                                    >
                                        {!user?.profile_image && user?.name.charAt(0)}
                                    </Avatar>
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography
                                            sx={{
                                                color: 'white',
                                                fontWeight: 500,
                                                fontSize: isMobile ? '15px' : '14px'
                                            }}
                                        >
                                            {user?.name}
                                        </Typography>

                                        {/* Unread count chip */}
                                        {liveUnreadCounts?.some(m => m.sender_id === user?.id) && (
                                            <Chip
                                                label={liveUnreadCounts.find(m => m.sender_id === user?.id)?.unreadCount}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#8b5cf6',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    height: isMobile ? 20 : 24,
                                                    fontSize: isMobile ? '11px' : '12px'
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        sx={{
                                            color: user?.isOnline ? 'green' : 'gray',
                                            fontSize: isMobile ? '13px' : '0.875rem',
                                            mt: 0.5
                                        }}
                                    >
                                        {user?.isOnline ? "Online" : "Offline"}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );

    // Welcome Screen Component
    const WelcomeScreen = () => (
        <Box
            sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.02)',
                position: 'relative',
                overflow: 'hidden',
                p: 2
            }}
        >
            <Box>
                <img
                    src={assets?.logo_icon}
                    alt=""
                    width={isMobile ? 80 : 100}
                    height={isMobile ? 80 : 100}
                />
            </Box>
            <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                    color: 'white',
                    fontWeight: 600,
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    mt: 2
                }}
            >
                Chat anytime, anywhere
            </Typography>
        </Box>
    );

    if (isChatLoading) {
        return <ChatsLoading />;
    }

    // Mobile Layout
    if (isMobile) {
        return (
            <Box sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)'
            }}>
                {/* Contacts View */}
                {mobileView === 'contacts' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <ContactsList />
                    </Box>
                )}

                {/* Chat View */}
                {mobileView === 'chat' && SelectedUser && (
                    <Box sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <ChatsSection
                            SelectedUser={SelectedUser}
                            onBackToContacts={handleBackToContacts}
                            handleShowMedia={handleShowMedia}
                            isMobile={isMobile}
                        />
                    </Box>
                )}

                {/* Media View */}
                {mobileView === 'media' && SelectedUser && (
                    <Box sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <MobileHeader
                            title="Media & Info"
                            showBack={true}
                            onBack={() => setMobileView('chat')}
                        />
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Media SelectedUser={SelectedUser} />
                        </Box>
                    </Box>
                )}

                {/* Menu */}
                {anchorEl && (
                    <Menu
                        id="mobile-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                            paper: {
                                style: {
                                    border: "1px solid #444",
                                    background: "rgba(0, 0, 0, 0.95)",
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    padding: '0px',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                                },
                            },
                        }}
                    >
                        {options?.map((option, index) => (
                            <MenuItem
                                key={index}
                                onClick={() => {
                                    option.handle?.();
                                }}
                                sx={{
                                    borderBottom: index !== options.length - 1 ? '1px solid #444' : 'none',
                                    padding: '10px 16px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                {option.key}
                            </MenuItem>
                        ))}
                    </Menu>
                )}
            </Box>
        );
    }

    // Desktop Layout
    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 1
            }}
        >
            <Paper
                elevation={24}
                sx={{
                    width: '100%',
                    maxWidth: 1200,
                    height: '90vh',
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    display: 'flex'
                }}
            >
                {/* Left Sidebar */}
                <Box
                    sx={{
                        flex: SelectedUser ? 0.3 : 1,
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <ContactsList />
                </Box>

                {/* Middle Area - Chat */}
                {SelectedUser && (
                    <Box sx={{
                        flex: showMediaPanel ? 0.5 : 0.7,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <ChatsSection
                            SelectedUser={SelectedUser}
                            onShowMedia={handleShowMedia}
                            showMediaPanel={showMediaPanel}
                            isMobile={false}
                        />
                    </Box>
                )}

                {/* Right Area - Media Panel */}
                {SelectedUser && showMediaPanel && (
                    <Box sx={{
                        flex: 0.2,
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                    }}>
                        <Media SelectedUser={SelectedUser} />
                    </Box>
                )}

                {/* Welcome Screen */}
                {!SelectedUser && <WelcomeScreen />}
            </Paper>

            {/* Desktop Menu */}
            {anchorEl && (
                <Menu
                    id="desktop-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                        paper: {
                            style: {
                                border: "1px solid #444",
                                background: "rgba(0, 0, 0, 0.95)",
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                padding: '0px',
                                borderRadius: '8px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                            },
                        },
                    }}
                >
                    {options?.map((option, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => {
                                option.handle?.();
                            }}
                            sx={{
                                borderBottom: index !== options.length - 1 ? '1px solid #444' : 'none',
                                padding: '10px 16px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            {option.key}
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </Box>
    );
};

export default HomePage;