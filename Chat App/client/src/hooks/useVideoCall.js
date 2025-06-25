import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const useVideoCall = (socket, currentUserId) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [currentCallId, setCurrentCallId] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  const remoteStreamRef = useRef();
  const pendingCandidatesRef = useRef([]);
  const isOfferCreatedRef = useRef(false);
  const isAnswerCreatedRef = useRef(false);

  // FIXED: Add a ref to track if this client is the caller.
  const isCallerRef = useRef(false);

  // WebRTC configuration
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:relay.metered.ca:80',
        username: 'openai',
        credential: 'chatgpt'
      }
    ]
  };

  // Initialize media devices
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(e => console.log('Local video autoplay prevented:', e));
      }
      setIsVideoEnabled(stream.getVideoTracks()[0]?.enabled ?? true);
      setIsAudioEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
      return stream;
    } catch (error) {
      toast.error('Failed to access camera/microphone');
      throw error;
    }
  };

  // Create peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(rtcConfiguration);

    pc.onicecandidate = (event) => {
      if (event.candidate && currentCallId) {
        socket.emit('webrtc-ice-candidate', { callId: currentCallId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play().catch(e => console.log('Remote video play error:', e));
        }
        // Fallback: Assume connection is OK if track is received
        setCallStatus('connected');
      }
    };


    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        toast.error('Connection lost');
        endCall();
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallStatus('connected');
      }
    };

    return pc;
  };

  // Process pending ICE candidates
  const processPendingCandidates = async (pc) => {
    while (pendingCandidatesRef.current.length > 0) {
      const candidate = pendingCandidatesRef.current.shift();
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        console.error('❌ Failed to add pending ICE candidate:', err);
      }
    }
  };

  // Start video call
  const startVideoCall = async (receiverId, receiverName) => {
    try {
      isCallerRef.current = true; // FIXED: Set this user as the caller
      setCallStatus('calling');
      setIsCallActive(true);
      const stream = await initializeMedia();
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      socket.emit('initiate-video-call', { callerId: currentUserId, receiverId, callerName: receiverName });
    } catch (error) {
      console.error('Error starting video call:', error);
      endCall();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      isCallerRef.current = false; // FIXED: Set this user as the acceptor
      setCallStatus('connecting');
      setIsCallActive(true);
      const stream = await initializeMedia();
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      socket.emit('accept-video-call', { callId: incomingCall.callId });
      setCurrentCallId(incomingCall.callId);
      setIncomingCall(null);
    } catch (error) {
      toast.error('Failed to accept call');
      rejectCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('reject-video-call', { callId: incomingCall.callId, reason: 'declined' });
      setIncomingCall(null);
    }
  };

  // End current call
  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (currentCallId) {
      socket.emit('end-video-call', { callId: currentCallId });
    }
    pendingCandidatesRef.current = [];
    isOfferCreatedRef.current = false;
    isAnswerCreatedRef.current = false;
    isCallerRef.current = false; // FIXED: Reset the caller ref
    setIsCallActive(false);
    setCallStatus('idle');
    setCurrentCallId(null);
    setIncomingCall(null);
    remoteStreamRef.current = null;
  };

  const toggleTrack = (kind) => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getTracks().find(t => t.kind === kind);
      if (track) {
        track.enabled = !track.enabled;
        if (kind === 'video') setIsVideoEnabled(track.enabled);
        if (kind === 'audio') setIsAudioEnabled(track.enabled);
      }
    }
  };
  const toggleVideo = () => toggleTrack('video');
  const toggleAudio = () => toggleTrack('audio');

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onCallInitiated = ({ callId }) => {
      setCurrentCallId(callId);
      setCallStatus('ringing');
    };

    const onCallFailed = ({ error }) => {
      toast.error(`Call failed: ${error}`);
      endCall();
    };

    const onIncomingCall = (callData) => {
      if (isCallActive) {
        socket.emit('reject-video-call', { callId: callData.callId, reason: 'busy' });
        return;
      }
      setIncomingCall(callData);
      setCallStatus('incoming');
    };

    // FIXED: The main logic fix is here.
    const onCallAccepted = async ({ callId }) => {
      setCurrentCallId(callId);
      setCallStatus('connecting');

      // Only the original caller should create and send the offer.
      if (isCallerRef.current) {
        try {
          const pc = peerConnectionRef.current;
          if (!pc) throw new Error('Peer connection not available');
          if (isOfferCreatedRef.current) return console.log('Offer already created, skipping.');

          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
          await pc.setLocalDescription(offer);
          isOfferCreatedRef.current = true;

          socket.emit('webrtc-offer', { callId, offer });
        } catch (error) {
          toast.error('Failed to create offer');
          endCall();
        }
      } else {
        console.log('✅ Call accepted, I am the ACCEPTOR, waiting for offer.');
      }
    };

    const onCallRejected = ({ reason }) => {
      toast.info(`Call ${reason}`);
      endCall();
    };

    const onCallEnded = ({ reason }) => {
      toast.info(`Call ended: ${reason}`);
      endCall();
    };

    const onOffer = async ({ callId, offer }) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) throw new Error('Peer connection not available for offer');

        await pc.setRemoteDescription(offer);
        await processPendingCandidates(pc);

        if (isAnswerCreatedRef.current) return console.log('Answer already created, skipping.');

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        isAnswerCreatedRef.current = true;

        socket.emit('webrtc-answer', { callId, answer });
      } catch (error) {
        toast.error('Failed to handle offer');
        endCall();
      }
    };

    const onAnswer = async ({ callId, answer }) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) throw new Error('Peer connection not available for answer');

        // FIXED: Add defensive check to prevent InvalidStateError
        if (pc.signalingState !== 'have-local-offer') {
          return console.warn(`Received answer in wrong state: ${pc.signalingState}. Ignoring.`);
        }

        await pc.setRemoteDescription(answer);
        await processPendingCandidates(pc);
      } catch (error) {
        toast.error('Failed to handle answer');
        endCall();
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error('❌ Failed to add ICE candidate:', err);
        }
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    socket.on('call-initiated', onCallInitiated);
    socket.on('call-failed', onCallFailed);
    socket.on('incoming-video-call', onIncomingCall);
    socket.on('call-accepted', onCallAccepted);
    socket.on('call-rejected', onCallRejected);
    socket.on('call-ended', onCallEnded);
    socket.on('webrtc-offer', onOffer);
    socket.on('webrtc-answer', onAnswer);
    socket.on('webrtc-ice-candidate', onIceCandidate);

    return () => {
      socket.off('call-initiated', onCallInitiated);
      socket.off('call-failed', onCallFailed);
      socket.off('incoming-video-call', onIncomingCall);
      socket.off('call-accepted', onCallAccepted);
      socket.off('call-rejected', onCallRejected);
      socket.off('call-ended', onCallEnded);
      socket.off('webrtc-offer', onOffer);
      socket.off('webrtc-answer', onAnswer);
      socket.off('webrtc-ice-candidate', onIceCandidate);
    };
  }, [socket, currentUserId, isCallActive]);

  useEffect(() => {
    return () => endCall();
  }, []);

  return {
    isCallActive, incomingCall, callStatus, isVideoEnabled, isAudioEnabled,
    localVideoRef, remoteVideoRef,
    startVideoCall, acceptCall, rejectCall, endCall, toggleVideo, toggleAudio
  };
};

export default useVideoCall;