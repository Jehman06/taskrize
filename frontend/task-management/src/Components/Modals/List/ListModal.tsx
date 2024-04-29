import { Modal } from 'react-bootstrap';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setShowListModal } from '../../../redux/reducers/modalSlice';
import { setOpenListId } from '../../../redux/reducers/listSlice';

interface ListModalProps {
    listId: number;
}
// This component is for future updates
// Possibility to change the list description

const ListModal: React.FC<ListModalProps> = ({ listId }) => {
    const showListModal = useSelector((state: RootState) => state.modal.showListModal);
    const lists = useSelector((state: RootState) => state.list.lists);
    const list = lists.find((list) => list.id === listId);
    const dispatch = useDispatch();

    return (
        <>
            <Modal
                show={showListModal === listId}
                onHide={() => {
                    dispatch(setShowListModal(null));
                    dispatch(setOpenListId(null));
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{list?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {list?.description ? `Description: ${list.description}` : 'No description'}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ListModal;
