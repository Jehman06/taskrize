import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Member } from '../../redux/reducers/workspaceSlice';
import './Dropdown.css';
import { setSelectedUsers } from '../../redux/reducers/appSlice';
import AsyncSelect from 'react-select/async';
import { verifyAccessToken } from '../../utils/apiUtils';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Button } from 'react-bootstrap';

interface UserQueryDropdownProps {
    searchResults?: Member[];
    id: number;
}

const UserQueryDropdown: React.FC<UserQueryDropdownProps> = ({ id }) => {
    const selectedUsers = useSelector((state: RootState) => state.app.selectedUsers);
    const dispatch = useDispatch();

    // Function to query through the database to search members
    const loadOptions = async (inputValue: string) => {
        try {
            verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            // Send a GET request to search for users
            const response = await axios.get(
                `http://127.0.0.1:8000/api/user/profiles/?search=${inputValue}&workspace_id=${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const users = response.data;
            // Map though users and set the values and labels
            const options = users.map((user: Member) => ({
                value: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    nickname: user.nickname,
                },
                label: user.name && user.nickname ? `${user.name} (${user.nickname})` : user.email,
            }));
            return options;
        } catch (error) {
            console.error('Error searching for users:', error);
            return [];
        }
    };

    const handleChange = (selectedOptions: any) => {
        const selectedUsers = selectedOptions.map((option: any) => ({
            id: option.value.id,
            email: option.value.email,
            name: option.value.name,
            nickname: option.value.nickname,
        }));

        // Dispatch an action to update the state in your Redux store
        dispatch(setSelectedUsers(selectedUsers));
    };

    // Function to send the invite and notifications to the selected users
    const inviteUsers = async (): Promise<void> => {
        try {
            verifyAccessToken();
            const accessToken = Cookies.get('access_token');

            // Get the recipient IDs from selectedUsers
            const recipientIds = selectedUsers.map((user) => user.id);

            const workspaceId = id;

            // Send a POST request to send invite and notifications to selected users
            const response = await axios.post(
                'http://127.0.0.1:8000/api/workspaces/members/invite',
                {
                    selected_user_ids: recipientIds,
                    workspace_id: workspaceId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            // TODO: Better error handling
            console.log(response.data);
        } catch (error) {
            console.error('Error inviting users:', error);
        }
    };

    return (
        <div>
            <AsyncSelect
                loadOptions={loadOptions}
                isMulti
                isClearable
                isSearchable
                onChange={handleChange}
                className="async-select"
            />
            <Button variant="secondary" onClick={inviteUsers} className="invite-button">
                Invite users
            </Button>
        </div>
    );
};

export default React.memo(UserQueryDropdown);
