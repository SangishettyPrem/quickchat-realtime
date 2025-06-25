import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js"
import chatRoutes from "./routes/ChatRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import conversationRoutes from "./routes/ConversationRoutes.js"
import envConfig from "./config/envConfig.js";
import cookieParser from "cookie-parser";
import "./config/dbConnection.js"
import path from "path"
import { fileURLToPath } from "url";
import http from 'http';
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://192.168.1.3:5173", // Your local IP
        "http://127.0.0.1:5173",
        "https://tangy-rules-drop.loca.lt"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};
const io = new Server(server, {
    cors: corsOptions
});
global.io = io;

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth/", authRoutes);
app.use("/api/auth/", chatRoutes);
app.use('/api/auth/messages', messageRoutes);
app.use('/api/auth/conversation', conversationRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

let onlineUsers = new Map();
let activeCalls = new Map(); // callId -> { caller, receiver, status }

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Existing chat functionality
    socket.on('join', (userId) => {
        socket.join(String(userId));
        onlineUsers.set(userId, socket.id);
        socket.userId = userId; // Store userId on socket for easier cleanup
        io.emit('update-online-users', Array.from(onlineUsers.keys()));
        console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    socket.on('typing', ({ senderId, receiverId }) => {
        io.emit('show-typing', { senderId, receiverId });
    });

    socket.on('stop-typing', ({ senderId, receiverId }) => {
        io.emit('hide-typing', { senderId, receiverId });
    });

    // VIDEO CALL FUNCTIONALITY

    // Handle video call initiation
    socket.on('initiate-video-call', ({ callerId, receiverId, callerName }) => {
        console.log("callerName: ", callerName);
        console.log("callerId: ", callerId);
        console.log("receiverId: ", receiverId);
        const receiverSocketId = onlineUsers.get(receiverId);

        if (receiverSocketId) {
            const callId = `call_${callerId}_${receiverId}_${Date.now()}`;

            // Store call information
            activeCalls.set(callId, {
                callId,
                caller: callerId,
                receiver: receiverId,
                callerSocketId: socket.id,
                receiverSocketId,
                status: 'ringing',
                createdAt: Date.now()
            });

            // Send call invitation to receiver
            io.to(receiverSocketId).emit('incoming-video-call', {
                callId,
                callerId,
                callerName: callerName || 'Unknown User',
                callerSocketId: socket.id
            });

            // Confirm call initiation to caller
            socket.emit('call-initiated', {
                callId,
                receiverId,
                status: 'ringing'
            });

            console.log(`[VIDEO CALL] Call initiated: ${callId}`);

            // Set timeout for unanswered calls (30 seconds)
            setTimeout(() => {
                const call = activeCalls.get(callId);
                if (call && call.status === 'ringing') {
                    console.log(`[VIDEO CALL] Call timeout: ${callId}`);

                    // Notify caller about timeout
                    io.to(call.callerSocketId).emit('call-failed', {
                        error: 'Call timeout - no answer',
                        callId
                    });

                    // Clean up
                    activeCalls.delete(callId);
                }
            }, 30000);

        } else {
            // Receiver is offline
            socket.emit('call-failed', {
                error: 'User is offline',
                receiverId
            });
            console.log(`[VIDEO CALL] Call failed - user ${receiverId} is offline`);
        }
    });

    // Handle call acceptance
    socket.on('accept-video-call', ({ callId }) => {
        const call = activeCalls.get(callId);

        console.log(`[VIDEO CALL] Accept attempt for: ${callId}`);
        console.log(`[VIDEO CALL] Call status:`, call?.status);

        if (call && call.status === 'ringing') {
            // Update call status
            call.status = 'accepted';
            call.acceptedAt = Date.now();
            activeCalls.set(callId, call);

            // Notify caller that call was accepted
            io.to(call.callerSocketId).emit('call-accepted', {
                callId,
                receiverId: call.receiver,
                status: 'accepted'
            });

            // Notify receiver (confirming acceptance)
            socket.emit('call-accepted', {
                callId,
                callerId: call.caller,
                status: 'accepted'
            });

            console.log(`[VIDEO CALL] Call accepted: ${callId}`);

            // Set timeout for connection establishment (15 seconds)
            setTimeout(() => {
                const currentCall = activeCalls.get(callId);
                if (currentCall && currentCall.status === 'accepted') {
                    console.log(`[VIDEO CALL] Connection timeout: ${callId}`);

                    // Notify both parties
                    io.to(currentCall.callerSocketId).emit('call-ended', {
                        callId,
                        reason: 'Connection timeout'
                    });
                    io.to(currentCall.receiverSocketId).emit('call-ended', {
                        callId,
                        reason: 'Connection timeout'
                    });

                    // Clean up
                    activeCalls.delete(callId);
                }
            }, 15000);

        } else if (!call) {
            console.log(`[VIDEO CALL] Accept failed - call not found: ${callId}`);
            socket.emit('call-failed', {
                error: 'Call not found',
                callId
            });
        } else {
            console.log(`[VIDEO CALL] Accept failed - invalid status: ${call.status}`);
            socket.emit('call-failed', {
                error: `Call already ${call.status}`,
                callId
            });
        }
    });

    // Handle call rejection
    socket.on('reject-video-call', ({ callId, reason = 'declined' }) => {
        const call = activeCalls.get(callId);

        console.log(`[VIDEO CALL] Reject: ${callId}, reason: ${reason}`);

        if (call) {
            // Notify caller about rejection
            io.to(call.callerSocketId).emit('call-rejected', {
                callId,
                reason,
                receiverId: call.receiver
            });

            // Remove call from active calls
            activeCalls.delete(callId);

            console.log(`[VIDEO CALL] Call rejected and cleaned up: ${callId}`);
        } else {
            console.log(`[VIDEO CALL] Reject failed - call not found: ${callId}`);
        }
    });

    // Handle call end
    socket.on('end-video-call', ({ callId }) => {
        const call = activeCalls.get(callId);

        console.log(`[VIDEO CALL] End call: ${callId}`);

        if (call) {
            // Determine the other participant
            const otherSocketId = call.callerSocketId === socket.id ?
                call.receiverSocketId : call.callerSocketId;

            // Notify the other participant
            io.to(otherSocketId).emit('call-ended', {
                callId,
                reason: 'Call ended by participant'
            });

            // Remove call from active calls
            activeCalls.delete(callId);

            console.log(`[VIDEO CALL] Call ended and cleaned up: ${callId}`);
        } else {
            console.log(`[VIDEO CALL] End call failed - call not found: ${callId}`);
        }
    });

    // WebRTC Signaling Events

    // Handle offer
    socket.on('webrtc-offer', ({ callId, offer }) => {
        const call = activeCalls.get(callId);

        console.log(`[WEBRTC] Offer received for call: ${callId}`);

        if (call) {
            // Update call status to connecting
            if (call.status === 'accepted') {
                call.status = 'connecting';
                call.offerSentAt = Date.now();
                activeCalls.set(callId, call);
            }

            // Forward offer to the receiver (non-caller)
            const targetSocketId = call.callerSocketId === socket.id ?
                call.receiverSocketId : call.callerSocketId;

            console.log(`[WEBRTC] Forwarding offer to socket: ${targetSocketId}`);

            io.to(targetSocketId).emit('webrtc-offer', {
                callId,
                offer,
                sender: socket.id
            });

        } else {
            console.log(`[WEBRTC] Offer failed - call ${callId} not found`);
            socket.emit('call-failed', {
                error: 'Call session not found',
                callId
            });
        }
    });

    // Handle answer
    socket.on('webrtc-answer', ({ callId, answer }) => {
        const call = activeCalls.get(callId);

        console.log(`[WEBRTC] Answer received for call: ${callId}`);

        if (call) {
            // Update call status
            if (call.status === 'connecting') {
                call.answerSentAt = Date.now();
                activeCalls.set(callId, call);
            }

            // Forward answer to the caller
            const targetSocketId = call.callerSocketId === socket.id ?
                call.receiverSocketId : call.callerSocketId;

            console.log(`[WEBRTC] Forwarding answer to socket: ${targetSocketId}`);

            io.to(targetSocketId).emit('webrtc-answer', {
                callId,
                answer,
                sender: socket.id
            });

        } else {
            console.log(`[WEBRTC] Answer failed - call ${callId} not found`);
            socket.emit('call-failed', {
                error: 'Call session not found',
                callId
            });
        }
    });

    // Handle ICE candidates
    socket.on('webrtc-ice-candidate', ({ callId, candidate }) => {
        const call = activeCalls.get(callId);

        if (call) {
            // Forward ICE candidate to the other participant
            const targetSocketId = call.callerSocketId === socket.id ?
                call.receiverSocketId : call.callerSocketId;

            io.to(targetSocketId).emit('webrtc-ice-candidate', {
                callId,
                candidate,
                sender: socket.id
            });

            // Uncomment for debugging ICE candidates
            // console.log(`[WEBRTC] ICE candidate forwarded for call: ${callId}, type: ${candidate.type || 'unknown'}`);

        } else {
            console.log(`[WEBRTC] ICE candidate failed - call ${callId} not found`);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Handle user going offline
        let disconnectedUserId = socket.userId;
        if (disconnectedUserId) {
            onlineUsers.delete(disconnectedUserId);
        }

        // End any active calls for this user
        for (let [callId, call] of activeCalls.entries()) {
            if (call.callerSocketId === socket.id || call.receiverSocketId === socket.id) {
                const otherSocketId = call.callerSocketId === socket.id ?
                    call.receiverSocketId : call.callerSocketId;

                // Notify the other participant
                io.to(otherSocketId).emit('call-ended', {
                    callId,
                    reason: 'User disconnected'
                });

                // Remove the call
                activeCalls.delete(callId);
                console.log(`[VIDEO CALL] Call ${callId} ended due to user disconnect`);
            }
        }

        // Broadcast updated online users
        io.emit('update-online-users', Array.from(onlineUsers.keys()));

        if (disconnectedUserId) {
            console.log(`User ${disconnectedUserId} disconnected and cleaned up`);
        }
    });

    // Periodic cleanup of stale calls (every 5 minutes)
    setInterval(() => {
        const now = Date.now();
        const staleCallIds = [];

        for (let [callId, call] of activeCalls.entries()) {
            const age = now - call.createdAt;
            // Remove calls older than 10 minutes
            if (age > 10 * 60 * 1000) {
                staleCallIds.push(callId);
            }
        }

        staleCallIds.forEach(callId => {
            console.log(`[CLEANUP] Removing stale call: ${callId}`);
            activeCalls.delete(callId);
        });

        if (staleCallIds.length > 0) {
            console.log(`[CLEANUP] Cleaned up ${staleCallIds.length} stale calls`);
        }
    }, 5 * 60 * 1000); // Run every 5 minutes
});

server.listen(envConfig.port, () => {
    console.log(`Server is running on port ${envConfig.port}`);
});