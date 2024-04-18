import React, { useEffect, useState } from 'react';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setBio, setProfile } from '../../redux/reducers/profileSlice';
import { setShowEmojiPicker } from '../../redux/reducers/emojiSlice';
import './Profile.css';
import { FaRegFaceSmileBeam, FaFaceSmileBeam } from 'react-icons/fa6';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const ProfilePage: React.FC = () => {
    const profile = useSelector((state: RootState) => state.profile.profile);
    const bio = useSelector((state: RootState) => state.profile.bio);
    const ShowEmojiPicker = useSelector((state: RootState) => state.emoji.showEmojiPicker);
    const dispatch = useDispatch();

    useEffect(() => {
        getUserProfile();
    }, []);

    const toggleEmojiPicker = () => {
        dispatch(setShowEmojiPicker(!ShowEmojiPicker));
    };

    const handleEmojiSelect = (emoji: any) => {
        dispatch(setBio(bio + emoji.native));
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

    return (
        <div className="profile-container">
            <div className="profile-content">
                <div className="profile-title">
                    <h1>Profile</h1>
                    <p>Update your user profile here</p>
                </div>
                <Form>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        className="profile-input"
                        placeholder={profile?.email || ''}
                    />
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        className="profile-input"
                        placeholder={profile?.name}
                    />
                    <Form.Label>NickName</Form.Label>
                    <Form.Control
                        type="text"
                        className="profile-input"
                        placeholder={profile?.nickname}
                    />
                    <Form.Label>Bio</Form.Label>
                    <div className="bio-input-wrapper">
                        <Form.Control
                            as="textarea"
                            rows={8}
                            className="profile-input"
                            placeholder={profile?.bio}
                            value={bio}
                            onChange={(e) => dispatch(setBio(e.target.value))}
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
                        <Button variant="success">Save</Button>
                    </div>
                </Form>
                <div className="danger-zone">
                    <h2>Danger Zone</h2>
                    <div className="danger-zone-content">
                        <Button variant="danger">Delete Account</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
