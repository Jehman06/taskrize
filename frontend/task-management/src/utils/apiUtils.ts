import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Function to verify the access token
export const verifyAccessToken = async (): Promise<void> => {
    let accessToken = Cookies.get('access_token') as string;
    const refreshToken = Cookies.get('refresh_token');

    try {
        // Verify the access token
        await axios.post(
            'http://127.0.0.1:8000/api/token/verify/',
            { token: accessToken },
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (verifyError) {
        // Handle token verification error
        const errorResponse = (verifyError as AxiosError).response;
        if (errorResponse && errorResponse.status === 401) {
            try {
                // If verification fails (status 401), refresh the access token
                const refreshResponse = await axios.post(
                    'http://127.0.0.1:8000/api/token/refresh/',
                    { refresh: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );
                // Update the access token with the refreshed token from the response
                accessToken = refreshResponse.data.access;
                // Store new token in cookies
                Cookies.set('access_token', accessToken ?? '');
            } catch (refreshError) {
                console.error('Error refreshing access token:', refreshError);
                throw refreshError;
            }
        } else {
            // Handle other verification errors
            console.error('Error verifying access token:', verifyError);
            throw verifyError;
        }
    }
};
