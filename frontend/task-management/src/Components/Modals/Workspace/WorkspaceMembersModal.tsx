import React from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import '../Modal.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setSearchQuery } from '../../../redux/reducers/appSlice';

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
    const dispatch = useDispatch();

    return (
        <>
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#33373a', color: '#9fadbc' }}>
                    <Modal.Title>*Workspace name* members</Modal.Title>
                </Modal.Header>
                <Modal.Body
                    style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
                    className="modal-body"
                >
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
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                    {/* Maybe, once they're selected, displayed the selected people, in a list? */}
                    {/* Button that sends an invite to all these people */}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default WorkspaceMembersModal;
