import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser, logoutUser } from '../redux/reducers/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async (): Promise<void> => {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (accessToken && refreshToken) {
                try {
                    // Check if the access token is expired
                    const accessTokenExp = JSON.parse(atob(accessToken.split('.')[1])).exp;
                    const currentTime = Math.floor(Date.now() / 1000);

                    if (accessTokenExp > currentTime) {
                        // Access token is still valid, user is authenticated
                        dispatch(loginUser({ accessToken, refreshToken }));
                    } else {
                        // Access token is expired, refresh tokens
                        const refreshResponse = await axios.post(
                            'http://127.0.0.1:8000/api/token/refresh/',
                            { refresh: refreshToken }
                        );
                        if (refreshResponse.status === 200) {
                            const newAccessToken = refreshResponse.data.access;
                            localStorage.setItem('accessToken', newAccessToken);
                            dispatch(loginUser({ accessToken: newAccessToken, refreshToken }));
                        } else {
                            // Refresh token is expired or invalid, log out the user
                            dispatch(logoutUser());
                            navigate('/');
                        }
                    }
                } catch (error) {
                    console.error('Error refreshing tokens:', error);
                    // Handle error refreshing tokens
                }
            } else {
                // Tokens not found, log out the user
                dispatch(logoutUser());
                navigate('/');
            }
        };

        checkAuthStatus();
    }, [dispatch, navigate]);

    return null;
};

export default useAuth;
