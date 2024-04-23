import React, { ChangeEvent, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import {
    fetchSearchResults,
    resetSearchResults,
    setInputFocus,
    setSearchQuery,
} from '../../../redux/reducers/appSlice';
import debounce from 'lodash.debounce';
import { verifyAccessToken } from '../../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';
import UserQueryDropdown from '../../Dropdowns/UserQuery';

interface Member {
    email: string;
    name?: string;
    nickname?: string;
}

interface WorkspaceMembersModalProps {
    show: boolean;
    onHide: () => void;
    members: Member[];
}

const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({ show, onHide, members }) => {
    const searchQuery = useSelector((state: RootState) => state.app.query);
    const searchResults = useSelector((state: RootState) => state.app.searchResults);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('searchResults:', searchResults); // Add this line to check searchResults
    }, [searchResults]);

    const debounceSearchUsers = debounce(async (query: string) => {
        try {
            await verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            const response = await axios.get(
                `http://127.0.0.1:8000/api/user/profiles/?q=${query}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            dispatch(fetchSearchResults(response.data)); // Assuming response.data contains search results
        } catch (error) {
            console.error('Error searching for users:', error);
        }
    }, 300); // Adjust debounce delay to 300 milliseconds

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        dispatch(setSearchQuery(query));
        if (query.trim() === '') {
            dispatch(resetSearchResults()); // Reset search results if query is empty
        } else {
            debounceSearchUsers(query);
        }
    };

    const handleInputFocus = () => {
        dispatch(setInputFocus(true));
    };

    // Function to handle input blur
    const handleInputBlur = () => {
        dispatch(setInputFocus(false)); // Call handleInputChange with false when input is blurred
    };

    useEffect(() => {
        return () => {
            debounceSearchUsers.cancel(); // Cleanup debounce function on unmount
        };
    }, []);

    return (
        <>
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                    <Modal.Title>*Workspace name* members</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                    {members.map((member, index) => (
                        <div key={index}>
                            {member.name && member.nickname ? (
                                <p>
                                    {member.name}, {member.nickname}
                                </p>
                            ) : (
                                <p>{member.email}</p>
                            )}
                        </div>
                    ))}
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => {
                            handleChange(e);
                        }}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    <UserQueryDropdown searchResults={searchResults} />
                    {/* Button that sends an invite to all these people */}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default WorkspaceMembersModal;
