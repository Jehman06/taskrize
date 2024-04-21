import React from 'react';
import { Modal } from 'react-bootstrap';
import '../Modal.css';

interface ProfileModalProps {
    show: boolean;
    onHide: () => void;
    children: React.ReactNode;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ show, onHide, children }) => {
    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered>
            <Modal.Body
                className="modal-body"
                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
            >
                {children}
            </Modal.Body>
        </Modal>
    );
};

export default ProfileModal;
