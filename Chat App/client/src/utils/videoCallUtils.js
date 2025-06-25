// webrtcUtils.js
export const checkBrowserSupport = () => {
    const isWebRTCSupported = !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        window.RTCPeerConnection
    );

    if (!isWebRTCSupported) {
        console.warn('WebRTC is not supported in this browser');
        return false;
    }

    return true;
};

export const requestPermissions = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // Stop the stream immediately as we just wanted to request permissions
        stream.getTracks().forEach(track => track.stop());

        return { success: true };
    } catch (error) {
        console.error('Permission denied:', error);
        return {
            success: false,
            error: error.name === 'NotAllowedError' ? 'Permission denied' : 'Device not available'
        };
    }
};

export const getMediaConstraints = (videoEnabled = true, audioEnabled = true) => {
    return {
        video: videoEnabled ? {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user',
            frameRate: { ideal: 30, max: 60 }
        } : false,
        audio: audioEnabled ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
        } : false
    };
};

export const getRTCConfiguration = () => {
    return {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
    };
};

export const handleMediaError = (error) => {
    console.error('Media error:', error);

    switch (error.name) {
        case 'NotFoundError':
        case 'DevicesNotFoundError':
            return 'No camera or microphone found. Please connect a device and try again.';
        case 'NotReadableError':
        case 'TrackStartError':
            return 'Camera or microphone is already in use by another application.';
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
            return 'Camera or microphone does not meet the required specifications.';
        case 'NotAllowedError':
        case 'PermissionDeniedError':
            return 'Camera and microphone access denied. Please allow permissions and try again.';
        case 'TypeError':
            return 'Invalid media constraints. Please check your settings.';
        case 'AbortError':
            return 'Media access was aborted. Please try again.';
        default:
            return `Media access failed: ${error.message || 'Unknown error'}`;
    }
};

export const logConnectionState = (pc, callId) => {
    if (!pc) return;

    console.log(`[${callId}] Connection State:`, {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState
    });
};

export const debugPeerConnection = (pc, label = 'PC') => {
    if (!pc) {
        console.log(`${label}: No peer connection`);
        return;
    }

    console.log(`${label} Debug Info:`, {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
        localDescription: pc.localDescription ? {
            type: pc.localDescription.type,
            sdp: pc.localDescription.sdp.slice(0, 100) + '...'
        } : null,
        remoteDescription: pc.remoteDescription ? {
            type: pc.remoteDescription.type,
            sdp: pc.remoteDescription.sdp.slice(0, 100) + '...'
        } : null,
        senders: pc.getSenders().map(sender => ({
            track: sender.track ? sender.track.kind : 'no track'
        })),
        receivers: pc.getReceivers().map(receiver => ({
            track: receiver.track ? receiver.track.kind : 'no track'
        }))
    });
};

export const createOfferOptions = () => {
    return {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: true,
        iceRestart: false
    };
};

export const createAnswerOptions = () => {
    return {
        voiceActivityDetection: true
    };
};