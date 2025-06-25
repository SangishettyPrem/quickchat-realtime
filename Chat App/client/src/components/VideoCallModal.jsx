import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash } from 'react-icons/fa';
import { useEffect } from 'react';

const VideoCallModal = ({
    isOpen,
    localVideoRef,
    remoteVideoRef,
    callStatus,
    isVideoEnabled,
    isAudioEnabled,
    onToggleVideo,
    onToggleAudio,
    onEndCall,
    participantName = 'Unknown'
}) => {
    if (!isOpen) return null;

    const getStatusText = () => {
        switch (callStatus) {
            case 'calling': return 'Calling...';
            case 'ringing': return 'Ringing...';
            case 'connecting': return 'Connecting...';
            case 'connected': return 'Connected';
            default: return '';
        }
    };

    // Handle video element events
    useEffect(() => {
        if (remoteVideoRef.current) {
            const remoteVideo = remoteVideoRef.current;
            
            const handleLoadedMetadata = () => {
                remoteVideo.play().catch(e => console.log('Remote video play error:', e));
            };

            const handlePlay = () => {
                console.log('Remote video started playing');
            };

            const handleError = (e) => {
                console.error('Remote video error:', e);
            };

            remoteVideo.addEventListener('loadedmetadata', handleLoadedMetadata);
            remoteVideo.addEventListener('play', handlePlay);
            remoteVideo.addEventListener('error', handleError);

            return () => {
                remoteVideo.removeEventListener('loadedmetadata', handleLoadedMetadata);
                remoteVideo.removeEventListener('play', handlePlay);
                remoteVideo.removeEventListener('error', handleError);
            };
        }
    }, [remoteVideoRef.current]);

    useEffect(() => {
        if (localVideoRef.current) {
            const localVideo = localVideoRef.current;
            
            const handleLoadedMetadata = () => {
                localVideo.play().catch(e => console.log('Local video play error:', e));
            };

            localVideo.addEventListener('loadedmetadata', handleLoadedMetadata);

            return () => {
                localVideo.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [localVideoRef.current]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="w-full h-full max-w-6xl max-h-full bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                            callStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                        }`}></div>
                        <span className="text-white font-medium">{participantName}</span>
                        <span className="text-gray-400 text-sm">{getStatusText()}</span>
                    </div>
                    <button
                        onClick={onEndCall}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        End Call
                    </button>
                </div>

                {/* Video Area */}
                <div className="flex-1 relative bg-black">
                    {/* Remote Video (Main) */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        muted={false}
                        className="w-full h-full object-cover"
                        style={{ 
                            display: callStatus === 'connected' ? 'block' : 'none',
                            backgroundColor: 'black'
                        }}
                        onLoadedMetadata={() => console.log('Remote video metadata loaded in component')}
                        onPlay={() => console.log('Remote video playing in component')}
                        onError={(e) => console.error('Remote video error in component:', e)}
                    />

                    {/* Local Video (Picture-in-Picture) */}
                    <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            style={{ backgroundColor: 'black' }}
                            onLoadedMetadata={() => console.log('Local video metadata loaded in component')}
                        />
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                <FaVideoSlash className="text-gray-400 text-2xl" />
                            </div>
                        )}
                    </div>

                    {/* No Video Placeholder */}
                    {callStatus !== 'connected' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="text-center text-white">
                                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaVideo className="text-3xl text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">{participantName}</p>
                                <p className="text-gray-400">{getStatusText()}</p>
                                {callStatus === 'connecting' && (
                                    <div className="mt-4">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-6">
                    <button
                        onClick={onToggleAudio}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isAudioEnabled
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                        {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    </button>

                    <button
                        onClick={onToggleVideo}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoEnabled
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                    </button>

                    <button
                        onClick={onEndCall}
                        className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                        title="End call"
                    >
                        <FaPhoneSlash />
                    </button>
                </div>
            </div>
        </div>
    );
};

// components/IncomingCallModal.jsx
export const IncomingCallModal = ({
    isOpen,
    callerName,
    onAccept,
    onReject
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaVideo className="text-2xl text-white" />
                    </div>
                    <h3 className="text-xl font-semibold !text-black mb-2">
                        Incoming Video Call
                    </h3>
                    <p className="!text-black">
                        {callerName} is calling you...
                    </p>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={onReject}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                        <FaPhoneSlash className="mr-2" />
                        Decline
                    </button>

                    <button
                        onClick={onAccept}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                        <FaVideo className="mr-2" />
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

// components/VideoCallButton.jsx
export const VideoCallButton = ({
    onClick,
    disabled = false,
    isOnline = true,
    className = ""
}) => {
    const handleClick = () => {
        if (!disabled && isOnline) {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled || !isOnline}
            className={`
        inline-flex items-center justify-center p-2 rounded-lg transition-colors
        ${disabled || !isOnline
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
        ${className}
      `}
            title={!isOnline ? 'User is offline' : 'Start video call'}
        >
            <FaVideo className="text-sm" />
        </button>
    );
};

export default VideoCallModal;