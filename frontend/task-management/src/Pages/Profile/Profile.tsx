import React, { useEffect, useState } from 'react';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios, { AxiosResponse } from 'axios';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setFormProfileData, setProfile, UserProfile } from '../../redux/reducers/profileSlice';
import { setShowEmojiPicker } from '../../redux/reducers/emojiSlice';
import './Profile.css';
import { FaRegFaceSmileBeam, FaFaceSmileBeam } from 'react-icons/fa6';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const ProfilePage: React.FC = () => {
    const profile = useSelector((state: RootState) => state.profile.profile);
    const formProfileData = useSelector((state: RootState) => state.profile.formProfileData);
    const ShowEmojiPicker = useSelector((state: RootState) => state.emoji.showEmojiPicker);
    const dispatch = useDispatch();

    useEffect(() => {
        // Get the user information
        const getUserProfile = async () => {
            try {
                await verifyAccessToken();
                const accessToken = Cookies.get('access_token');
                const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                console.log('User Profile: ', response.data);
                dispatch(setProfile(response.data));
            } catch (error) {
                console.error('Error fetching profile information: ', error);
            }
        };

        getUserProfile();
    }, [dispatch]);

    useEffect(() => {
        // Set formProfileData fields to profile fields when the profile object changes
        if (profile) {
            dispatch(
                setFormProfileData({
                    ...formProfileData,
                    name: profile.name || '',
                    nickname: profile.nickname || '',
                    bio: profile.bio || '',
                })
            );
        }
    }, [dispatch, profile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        dispatch(setFormProfileData({ ...(formProfileData as UserProfile), [name]: value }));
    };

    const toggleEmojiPicker = () => {
        dispatch(setShowEmojiPicker(!ShowEmojiPicker));
    };

    const handleEmojiSelect = (emoji: any) => {
        dispatch(
            setFormProfileData({
                ...(formProfileData as UserProfile),
                bio: formProfileData.bio + emoji.native,
            })
        );
    };

    // Get the user information
    const getUserProfile = async () => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');
            const response = await axios.get('http://127.0.0.1:8000/api/user/profile', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log('User Profile: ', response.data);
            dispatch(setProfile(response.data));
        } catch (error) {
            console.error('Error fetching profile information: ', error);
        }
    };

    const updateProfile = async (): Promise<void> => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            // Create a copy of the formProfileData
            const updatedData = { ...formProfileData };

            // Remove fields that haven't changed or are empty
            Object.keys(updatedData).forEach((key) => {
                if (updatedData[key] === profile?.[key]) {
                    delete updatedData[key];
                }
            });

            // Check if there are any updates to send
            if (Object.keys(updatedData).length === 0) {
                console.log('No updates to send');
                return;
            }

            const response: AxiosResponse = await axios.put(
                `http://127.0.0.1:8000/api/user/profile/update/${profile?.id}/`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Profile successfully updated', response.data);
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile', error);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-content">
                <div className="profile-title">
                    <h1>Profile</h1>
                </div>
                <Form>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        className="profile-input"
                        name="name"
                        value={formProfileData.name || ''}
                        onChange={handleInputChange}
                    />
                    <Form.Label>NickName</Form.Label>
                    <Form.Control
                        type="text"
                        className="profile-input"
                        name="nickname"
                        value={formProfileData.nickname || ''}
                        onChange={handleInputChange}
                    />
                    <Form.Label>Bio</Form.Label>
                    <div className="bio-input-wrapper">
                        <Form.Control
                            as="textarea"
                            rows={8}
                            className="profile-input"
                            name="bio"
                            value={formProfileData.bio || ''}
                            onChange={handleInputChange}
                        />
                        <div className="emoji-toggle" onClick={toggleEmojiPicker}>
                            {ShowEmojiPicker ? <FaFaceSmileBeam /> : <FaRegFaceSmileBeam />}
                        </div>
                        <div className="emoji-picker-wrapper">
                            {ShowEmojiPicker && data && (
                                <Picker
                                    className="emoji-picker"
                                    data={data}
                                    onEmojiSelect={handleEmojiSelect}
                                />
                            )}
                        </div>
                    </div>
                    <div className="profile-buttons">
                        <Button variant="success" onClick={updateProfile}>
                            Save
                        </Button>
                    </div>
                </Form>
                <div className="danger-zone">
                    <h2>Danger Zone</h2>
                    <div className="danger-zone-content">
                        <div className="danger-section">
                            <div className="left-content">
                                <b>
                                    <p>Delete Account</p>
                                </b>
                                <p>This action will delete your account permanently.</p>
                            </div>
                            <div className="danger-button">
                                <Button variant="danger">Delete Account</Button>
                            </div>
                        </div>
                        <div className="danger-section">
                            <div className="left-content">
                                <b>
                                    <p>Update Email</p>
                                </b>
                                <p>Update your email address.</p>
                            </div>
                            <div className="danger-button">
                                <Button variant="danger">Update Email</Button>
                            </div>
                        </div>
                        <div className="danger-section">
                            <div className="left-content">
                                <b>
                                    <p>Update Password</p>
                                </b>
                                <p>Update your password.</p>
                            </div>
                            <div className="danger-button">
                                <Button variant="danger">Update Password</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
