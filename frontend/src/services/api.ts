import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            
            if (!refreshToken) {
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Use a separate axios instance/call to avoid interceptor loops
                const refreshResponse = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
                
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                originalRequest.headers.Authorization = 'Bearer ' + accessToken;
                
                processQueue(null, accessToken);
                isRefreshing = false;
                
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Global Error Message Formatting
        let friendlyMessage = "An unexpected error occurred. Please try again.";
        
        if (!error.response) {
            friendlyMessage = "Network Error: Cannot connect to the server. Please check your internet connection.";
        } else {
            const status = error.response.status;
            
            // Generate friendly message based on HTTP status
            if (status === 400) {
                friendlyMessage = "Bad Request: The data you provided is invalid or incomplete.";
            } else if (status === 401) {
                friendlyMessage = "Unauthorized: Your session has expired. Please log in again.";
            } else if (status === 403) {
                friendlyMessage = "Forbidden: You don't have permission to perform this action.";
            } else if (status === 404) {
                friendlyMessage = "Not Found: The resource you are looking for does not exist or has been removed.";
            } else if (status === 409) {
                friendlyMessage = "Conflict: The action could not be completed due to a conflict (e.g. data already exists).";
            } else if (status === 429) {
                friendlyMessage = "Too Many Requests: Please slow down and try again later.";
            } else if (status === 500) {
                friendlyMessage = "Internal Server Error: Something went wrong on our end. Please try again later.";
            } else if (status === 502) {
                friendlyMessage = "Bad Gateway: The server is temporarily unavailable. Please try again later.";
            } else if (status === 503) {
                friendlyMessage = "Service Unavailable: The server is currently undergoing maintenance.";
            } else if (status === 504) {
                friendlyMessage = "Gateway Timeout: The server took too long to respond. Please try again.";
            } else if (status >= 500) {
                friendlyMessage = "A server error occurred (" + status + "). Please try again later.";
            }

            // Ensure error.response.data exists
            if (!error.response.data) {
                error.response.data = {};
            }

            // If it's a Spring Boot default error, or our custom API response doesn't have a specific error message
            const hasCustomApiError = typeof error.response.data?.error?.message === 'string';
            const isSpringBootError = typeof error.response.data?.error === 'string' && typeof error.response.data?.message === 'string';
            
            if (isSpringBootError || !hasCustomApiError) {
                // If it's a Spring Boot error, sometimes message contains raw Java exceptions like "org.springframework..."
                // We overwrite it with our friendly message.
                error.response.data.error = {
                    message: friendlyMessage,
                    originalMessage: error.response.data.message
                };
            }
        }

        if (!error.response) {
            error.response = { data: { error: { message: friendlyMessage } } };
        }

        return Promise.reject(error);
    }
);

export default api;
