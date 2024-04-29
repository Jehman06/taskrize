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
import '../Modal.css';

interface Member {
    email: string;
    name?: string;
    nickname?: string;
}

interface WorkspaceMembersModalProps {
    id: number;
    show: boolean;
    onHide: () => void;
    members: Member[];
    workspaceName: string;
}

const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({
    show,
    onHide,
    members,
    id,
    workspaceName,
}) => {
    const workspaceIdToShowModal = useSelector(
        (state: RootState) => state.modal.workspaceIdToShowModal
    );

    // Make sure it's the correct selected workspace
    if (id != workspaceIdToShowModal) {
        return null;
    }

    return (
        <>
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                    <Modal.Title>{workspaceName}'s members</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                    {members.map((member) => (
                        <div key={member.email} className="members-workspace-member">
                            <p className="members-workspace-member-items">
                                {member.name} {`(${member.nickname})`}
                            </p>
                            <p className="members-workspace-member-items">{member.email}</p>
                        </div>
                    ))}
                    <UserQueryDropdown id={id} />
                </Modal.Body>
            </Modal>
        </>
    );
};

export default WorkspaceMembersModal;
