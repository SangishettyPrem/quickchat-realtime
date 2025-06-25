const getBaseURL = () => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080/api/auth/';
    } else {
        // Use your network IP for mobile access
        return 'http://192.168.1.3:8080/api/auth/';
    }
};

export const baseURL = getBaseURL();
export const ImageBaseURL = "http://localhost:8080"