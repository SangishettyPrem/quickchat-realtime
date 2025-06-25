import { Avatar, Badge, Box, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ImageBaseURL } from "../config/url";
import { ArrowLeft, Loader, SendIcon, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { fetchMessages, GetOrCreateConversationId, MarkAsRead, sendMessage, setConversationId, setMessage } from "../redux/features/ChatSlice";
import socket from "../config/socket";
import notification from "../config/audio.mp3"
import debounce from 'lodash.debounce';
import useVideoCall from '../hooks/useVideoCall';
import VideoCallModal, { IncomingCallModal, VideoCallButton } from '../components/VideoCallModal';
import Media from "./Media";
import assets from "../assets/assets";
import { ToastContainer } from "react-toastify";

const ChatsSection = ({ SelectedUser, onBackToContacts }) => {
    const { user } = useSelector(state => state.auth);
    const [message, setmessage] = useState('');
    const { messages, isMessageSending, conversationId } = useSelector(state => state.chats);
    const dispatch = useDispatch();
    const notificationSound = new Audio(notification);
    const [isTyping, setIsTyping] = useState(false);
    const [showMediaPanel, setShowMediaPanel] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const {
        isCallActive,
        incomingCall,
        callStatus,
        isVideoEnabled,
        isAudioEnabled,
        localVideoRef,
        remoteVideoRef,
        startVideoCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleAudio
    } = useVideoCall(socket, user.id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleStartVideoCall = () => {
        if (SelectedUser) {
            console.log("ID: ", SelectedUser.id);
            console.log("name: ", SelectedUser.name);
            startVideoCall(SelectedUser.id, SelectedUser.name);
        }
    };

    const handleShowMedia = () => {
        setShowMediaPanel(!showMediaPanel);
    };

    useEffect(() => {
        socket.on('show-typing', ({ senderId }) => {
            if (senderId === SelectedUser?.id) {
                setIsTyping(true);
            }
        });

        socket.on('hide-typing', ({ senderId }) => {
            if (senderId === SelectedUser?.id) {
                setIsTyping(false);
            }
        });

        return () => {
            socket.off('show-typing');
            socket.off('hide-typing');
        };
    }, [SelectedUser]);

    const handleTyping = () => {
        socket.emit('typing', {
            senderId: user?.id,
            receiverId: SelectedUser?.id
        });
    };

    const handleStopTyping = () => {
        socket.emit('stop-typing', {
            senderId: user?.id,
            receiverId: SelectedUser?.id
        });
    };

    const debouncedStopTyping = debounce(() => {
        handleStopTyping();
    }, 2000);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        try {
            const request = {
                message: message,
                senderId: user?.id,
                conversationId: conversationId,
                receiverId: SelectedUser?.id
            }
            const result = await dispatch(sendMessage(request));
            if (result?.payload?.success) {
                setmessage('');
                handleStopTyping();
            }
        } catch (error) {
            console.error("Error occurred while sending message: ", error);
        }
    }

    useEffect(() => {
        socket.emit('join', user?.id);
        socket.on('receive-message', (message) => {
            if (message?.sender_id !== user?.id) {
                notificationSound.play();
            }
            dispatch(setMessage(message));
        });
        return () => {
            socket.off('receive-message');
        };
    }, [user?.id]);

    useEffect(() => {
        const getConversationID = async () => {
            const request = {
                userId: user?.id,
                selectedUserId: SelectedUser?.id
            }
            const result = await dispatch(GetOrCreateConversationId(request));
            await dispatch(MarkAsRead(SelectedUser?.id));
            if (result?.payload?.success) {
                const conversationId = result?.payload?.conversationId;
                await dispatch(setConversationId(conversationId));
                await dispatch(fetchMessages(conversationId));
            }
        }

        if (user?.id && SelectedUser?.id) {
            getConversationID();
        }
    }, [SelectedUser]);

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    height: "100%",
                    width: "100%",
                    overflow: "hidden",
                }}
            >
                {/* Main Chat Section */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        height: "100%",
                        minWidth: 0,
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: { xs: 1.5, sm: 2 },
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            background: "rgba(0, 0, 0, 0.2)",
                            backdropFilter: "blur(10px)",
                            zIndex: 10,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                            {isMobile && <IconButton
                                sx={{
                                    color: "rgba(255, 255, 255, 0.7)",
                                    p: { xs: 0.5, sm: 1 },
                                    "&:hover": {
                                        color: "white",
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    },
                                }}
                                onClick={onBackToContacts}
                            >
                                <ArrowLeft sx={{ fontSize: { xs: 18, sm: 20 } }} />

                            </IconButton>}
                            <Badge
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                variant="dot"
                                sx={{
                                    "& .MuiBadge-badge": {
                                        backgroundColor: SelectedUser?.isOnline ? "#4ade80" : "#6b7280",
                                        width: { xs: 10, sm: 12 },
                                        height: { xs: 10, sm: 12 },
                                        borderRadius: "50%",
                                        border: "2px solid rgba(0, 0, 0, 0.3)",
                                    },
                                }}
                            >
                                <Avatar
                                    src={ImageBaseURL + SelectedUser?.profile_image}
                                    sx={{
                                        width: { xs: 35, sm: 40 },
                                        height: { xs: 35, sm: 40 },
                                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    }}
                                >
                                    {!SelectedUser?.profile_image && SelectedUser?.name.charAt(0)}
                                </Avatar>
                            </Badge>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: { xs: "14px", sm: "16px" },
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        maxWidth: { xs: "120px", sm: "200px" },
                                    }}
                                >
                                    {SelectedUser?.name}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: SelectedUser?.isOnline ? "#4ade80" : "#6b7280",
                                        fontSize: { xs: "11px", sm: "12px" },
                                        fontWeight: 500,
                                    }}
                                >
                                    {isTyping ? "typing..." : (SelectedUser?.isOnline ? "Online" : "Offline")}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, }} >
                            <IconButton onClick={handleStartVideoCall}>
                                <Video fontSize={{ xs: 18, sm: 20 }} />
                            </IconButton>
                            <IconButton
                                sx={{
                                    color: "rgba(255, 255, 255, 0.7)",
                                    p: { xs: 0.5, sm: 1 },
                                    "&:hover": {
                                        color: "white",
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    },

                                }}
                                onClick={handleShowMedia}
                            >
                                <img src={assets?.help_icon} alt="Logo" style={{ height: 20 }} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages Container */}
                    <Box
                        ref={messagesContainerRef}
                        sx={{
                            flex: 1,
                            overflowY: "auto",
                            overflowX: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                            "&::-webkit-scrollbar": {
                                width: "6px",
                            },
                            "&::-webkit-scrollbar-track": {
                                background: "rgba(255, 255, 255, 0.1)",
                                borderRadius: "3px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "rgba(255, 255, 255, 0.3)",
                                borderRadius: "3px",
                                "&:hover": {
                                    background: "rgba(255, 255, 255, 0.5)",
                                },
                            },
                        }}
                    >
                        {/* Messages List */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: { xs: "8px", sm: "10px" },
                                padding: { xs: "12px", sm: "16px" },
                                minHeight: "min-content",
                            }}
                        >
                            {messages?.map((message, index) => {
                                const isOwnMessage = Number(user?.id) === Number(message?.sender_id);
                                const sender = isOwnMessage ? user : SelectedUser;
                                const messageTime = new Date(message?.created_at).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                );

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "flex-end",
                                            justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                                            gap: { xs: 0.5, sm: 1 },
                                            width: "100%",
                                        }}
                                    >
                                        {!isOwnMessage && (
                                            <Avatar
                                                src={ImageBaseURL + sender?.profile_image}
                                                sx={{
                                                    width: { xs: 24, sm: 30 },
                                                    height: { xs: 24, sm: 30 },
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {!sender?.profile_image && sender?.name?.charAt(0)}
                                            </Avatar>
                                        )}

                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                maxWidth: { xs: "75%", sm: "70%" },
                                                minWidth: 0,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: isOwnMessage ? "#4f46e5" : "#374151",
                                                    color: "white",
                                                    p: { xs: 1, sm: 1.5 },
                                                    borderRadius: 2,
                                                    borderBottomRightRadius: isOwnMessage ? "4px" : "16px",
                                                    borderBottomLeftRadius: !isOwnMessage ? "4px" : "16px",
                                                    wordBreak: "break-word",
                                                    overflowWrap: "break-word",
                                                    whiteSpace: "pre-wrap",
                                                    fontSize: { xs: "14px", sm: "16px" },
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {message?.message}
                                            </Box>

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: "rgba(255, 255, 255, 0.5)",
                                                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                                    mt: 0.5,
                                                    alignSelf: isOwnMessage ? "flex-end" : "flex-start",
                                                }}
                                            >
                                                {messageTime}
                                            </Typography>
                                        </Box>

                                        {isOwnMessage && (
                                            <Avatar
                                                src={ImageBaseURL + sender?.profile_image}
                                                sx={{
                                                    width: { xs: 24, sm: 30 },
                                                    height: { xs: 24, sm: 30 },
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {!sender?.profile_image && sender?.name?.charAt(0)}
                                            </Avatar>
                                        )}
                                    </Box>
                                );
                            })}

                            {/* Typing indicator */}
                            <Box sx={{ minHeight: 12 }}>
                                {isTyping && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-start",
                                            gap: 1,
                                        }}
                                    >
                                        <Avatar
                                            src={ImageBaseURL + SelectedUser?.profile_image}
                                            sx={{
                                                width: { xs: 24, sm: 30 },
                                                height: { xs: 24, sm: 30 },
                                                flexShrink: 0,
                                            }}
                                        >
                                            {!SelectedUser?.profile_image && SelectedUser?.name?.charAt(0)}
                                        </Avatar>
                                        <Box
                                            sx={{
                                                backgroundColor: "#374151",
                                                color: "white",
                                                p: { xs: 1, sm: 1.5 },
                                                borderRadius: 2,
                                                borderBottomLeftRadius: "4px",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: "14px", sm: "16px" },
                                                    fontStyle: "italic",
                                                    opacity: 0.8,
                                                }}
                                            >
                                                typing...
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            {/* Scroll anchor */}
                            <div ref={messagesEndRef} />
                        </Box>
                    </Box>

                    {/* Input Box */}
                    <Box
                        sx={{
                            flexShrink: 0,
                            padding: { xs: "12px", sm: "16px" },
                            borderTop: "1px solid rgba(255,255,255,0.1)",
                            backgroundColor: "rgba(0,0,0,0.3)",
                            backdropFilter: "blur(10px)",
                            zIndex: 10,
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Type a message..."
                            variant="outlined"
                            value={message || ""}
                            onChange={(e) => {
                                setmessage(e.target.value);
                                handleTyping();
                                debouncedStopTyping();
                            }}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            multiline
                            maxRows={3}
                            sx={{
                                backgroundColor: "rgba(255,255,255,0.1)",
                                borderRadius: { xs: "20px", sm: "24px" },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: { xs: "20px", sm: "24px" },
                                    color: "white",
                                    fontSize: { xs: "14px", sm: "16px" },
                                    padding: { xs: "8px 12px", sm: "12px 16px" },
                                    paddingRight: { xs: "8px", sm: "8px" },
                                    "& fieldset": {
                                        border: "none",
                                    },
                                },
                                "& input::placeholder, & textarea::placeholder": {
                                    color: "rgba(255,255,255,0.5)",
                                    opacity: 1,
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={handleSendMessage}
                                        disabled={!message.trim() || isMessageSending}
                                        sx={{
                                            color: message.trim() ? "#4f46e5" : "rgba(255,255,255,0.5)",
                                            p: { xs: 0.5, sm: 0.8 },
                                            ml: 1,
                                            backgroundColor: message.trim() ? "rgba(79, 70, 229, 0.1)" : "transparent",
                                            "&:hover": {
                                                backgroundColor: message.trim() ? "rgba(79, 70, 229, 0.2)" : "rgba(255, 255, 255, 0.05)",
                                            },
                                            "&:disabled": {
                                                color: "rgba(255,255,255,0.3)",
                                            },
                                        }}
                                    >
                                        {isMessageSending ? (
                                            <Loader
                                                sx={{
                                                    fontSize: { xs: 18, sm: 20 },
                                                    animation: "spin 1s linear infinite",
                                                    "@keyframes spin": {
                                                        "0%": { transform: "rotate(0deg)" },
                                                        "100%": { transform: "rotate(360deg)" },
                                                    },
                                                }}
                                            />
                                        ) : (
                                            <SendIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                        )}
                                    </IconButton>
                                ),
                            }}
                        />
                    </Box>
                </Box>

                {/* Media Panel - Desktop Only */}
                {showMediaPanel && (
                    <Box
                        sx={{
                            width: "350px",
                            borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                            height: "100%",
                            overflowY: "auto",
                            flexShrink: 0,
                        }}
                    >
                        <Media SelectedUser={SelectedUser} />
                    </Box>
                )}
            </Box>

            <VideoCallModal
                isOpen={isCallActive}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                callStatus={callStatus}
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                onToggleVideo={toggleVideo}
                onToggleAudio={toggleAudio}
                onEndCall={endCall}
                participantName={SelectedUser?.name || 'Unknown'}
            />

            {/* Incoming Call Modal */}
            <IncomingCallModal
                isOpen={!!incomingCall}
                callerName={incomingCall?.callerName || 'Unknown'}
                onAccept={acceptCall}
                onReject={rejectCall}
            />
            <ToastContainer />
        </>
    );
};

export default ChatsSection;