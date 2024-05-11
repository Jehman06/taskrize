import React, { useEffect, useReducer, useRef } from 'react';
import { Button, ButtonGroup, Modal } from 'react-bootstrap';
import {
    Card,
    setDueDate,
    setIsEditingDescription,
    setIsEditingTitle,
    setNewCardDescription,
    setNewCardTitle,
    updateSelectedCard,
} from '../../../redux/reducers/cardSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { DateTimePicker } from 'react-rainbow-components';
import { MdAlignHorizontalRight, MdOutlineCreditCard } from 'react-icons/md';
import { ImParagraphLeft } from 'react-icons/im';
import { RxCross2 } from 'react-icons/rx';
import { FaFaceSmileBeam, FaRegFaceSmileBeam } from 'react-icons/fa6';
import moment from 'moment';
import { Form } from 'react-bootstrap';
import { setShowEmojiPicker } from '../../../redux/reducers/emojiSlice';
import '../../../Pages/Profile/Profile.css';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface CardModalProps {
    card: Card | null;
    show: boolean;
    onHide: () => void;
    socket: WebSocket;
    boardId?: number;
}

interface updateCardParams {
    title?: string;
    description?: string;
    dueDate?: Date | string;
    label?: string;
}

const CardModal: React.FC<CardModalProps> = ({
    card,
    show,
    onHide,
    socket,
    boardId,
}) => {
    const isEditingTitle = useSelector(
        (state: RootState) => state.card.isEditingTitle,
    );
    const showEmojiPicker = useSelector(
        (state: RootState) => state.emoji.showEmojiPicker,
    );
    const newCardTitle = useSelector(
        (state: RootState) => state.card.newCardTitle,
    );
    const newCardDescription = useSelector(
        (state: RootState) => state.card.newCardDescription,
    );
    const dueDate = useSelector((state: RootState) => state.card.dueDate);
    const dispatch = useDispatch();

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                dispatch(setIsEditingTitle(false));
                setNewCardTitle('');
            }
        }

        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dispatch]);

    const handleEditTitle = () => {
        dispatch(setIsEditingTitle(!isEditingTitle));
        dispatch(setNewCardTitle(''));
    };

    const handleNewTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setNewCardTitle(e.target.value));
    };

    const onKeyDownTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            updateCardTitle({ title: newCardTitle });
            dispatch(setIsEditingTitle(false));
            dispatch(setNewCardTitle(''));
        } else if (e.key === 'Escape') {
            dispatch(setIsEditingTitle(false));
            dispatch(setNewCardTitle(''));
        }
    };

    // Open/close the emoji picker for the bio
    const toggleEmojiPicker = () => {
        dispatch(setShowEmojiPicker(!showEmojiPicker));
    };

    // Select emojis and add them to bio
    const handleEmojiSelect = (emoji: any) => {
        const textarea = document.getElementById(
            'description-textarea',
        ) as HTMLTextAreaElement;
        const cursorPos = textarea.selectionStart;
        const descriptionBeforeCursor = newCardDescription
            ? newCardDescription.slice(0, cursorPos)
            : '';
        const bioAfterCursor = newCardDescription
            ? newCardDescription.slice(cursorPos)
            : '';
        const updatedDescription =
            descriptionBeforeCursor + emoji.native + bioAfterCursor;

        dispatch(setNewCardDescription(updatedDescription));
    };

    const updateCardTitle = ({
        title,
        description,
        dueDate,
        label,
    }: updateCardParams = {}) => {
        console.log('title sent:', title);
        if (socket.readyState === WebSocket.OPEN) {
            try {
                socket.send(
                    JSON.stringify({
                        action: 'update_card',
                        card_id: card?.id,
                        title: title,
                        description: description,
                        due_date: dueDate,
                        label: label,
                        board_id: boardId,
                    }),
                );
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        if (card) {
            dispatch(setNewCardDescription(card.description || ''));
        }
    }, [card, dispatch]);

    return (
        <Modal
            show={show}
            onHide={onHide}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
        >
            <Modal.Header
                closeButton
                className="modal-body"
                style={{
                    backgroundColor: `${card?.label ? card.label : '#33373a'}`,
                    color: '#9fadbc',
                }}
            >
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body
                className="modal-body"
                style={{ backgroundColor: '#33373a', color: '#9fadbc' }}
            >
                <div className="card-modal-container">
                    <div className="card-title-container">
                        <MdOutlineCreditCard className="card-icon" />
                        {isEditingTitle ? (
                            <input
                                ref={inputRef}
                                className="card-title-input"
                                type="text"
                                value={newCardTitle}
                                onChange={handleNewTitle}
                                placeholder={card?.title}
                                onKeyDown={onKeyDownTitle}
                                minLength={1}
                                autoFocus
                            />
                        ) : (
                            <div
                                className="card-title"
                                onClick={handleEditTitle}
                            >
                                {card?.title}
                            </div>
                        )}
                    </div>
                    <div className="card-label-duedate-container">
                        <div className="card-label-duedate-header">
                            <p>Due date</p>
                            {/* <p>Label</p> */}
                        </div>
                        <div className="card-label-duedate-content">
                            <DateTimePicker
                                id="datetimepicker-1"
                                value={
                                    card?.due_date ? card?.due_date : undefined
                                }
                                placeholder="Select a date and time..."
                                onChange={value => {
                                    dispatch(
                                        setDueDate(
                                            value ? value.toISOString() : '',
                                        ),
                                    );
                                    updateCardTitle({
                                        dueDate: value || undefined,
                                    });
                                }}
                                formatStyle="medium"
                                style={{ width: '230px', cursor: 'pointer' }}
                            />
                            <RxCross2
                                className="date-cross"
                                onClick={() =>
                                    updateCardTitle({ dueDate: 'REMOVE' })
                                }
                            />
                            {/* <div className="card-labels">
                            <div
                                className="label"
                                style={{ backgroundColor: 'red' }}
                            ></div>
                            <div
                                className="label"
                                style={{ backgroundColor: 'blue' }}
                            ></div>
                            <div
                                className="label"
                                style={{ backgroundColor: 'green' }}
                            ></div>
                        </div> */}
                        </div>
                    </div>
                    <div className="description-container">
                        <p style={{ fontSize: '1.2rem' }}>
                            <ImParagraphLeft style={{ marginRight: '1rem' }} />{' '}
                            Description
                        </p>
                        <Form>
                            <div className="bio-input-wrapper">
                                <textarea
                                    rows={10}
                                    className="profile-input"
                                    name="description"
                                    value={newCardDescription}
                                    placeholder="Write a description for this task..."
                                    onChange={e =>
                                        dispatch(
                                            setNewCardDescription(
                                                e.target.value,
                                            ),
                                        )
                                    }
                                    id="description-textarea"
                                    style={{ width: '100%' }}
                                />
                                <div
                                    className="emoji-toggle"
                                    onClick={toggleEmojiPicker}
                                >
                                    {showEmojiPicker ? (
                                        <FaFaceSmileBeam />
                                    ) : (
                                        <FaRegFaceSmileBeam />
                                    )}
                                </div>
                                <div className="emoji-picker-wrapper">
                                    {showEmojiPicker && data && (
                                        <Picker
                                            className="emoji-picker"
                                            data={data}
                                            onEmojiSelect={handleEmojiSelect}
                                        />
                                    )}
                                </div>
                                <div className="description-button-container">
                                    <Button
                                        variant="primary"
                                        className="description-button"
                                        onClick={() =>
                                            updateCardTitle({
                                                description: newCardDescription,
                                            })
                                        }
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CardModal;
