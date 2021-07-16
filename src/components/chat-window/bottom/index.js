/* eslint-disable no-unused-vars */
import React, { useCallback, useState } from 'react';
import { Icon, Input, InputGroup, Alert } from 'rsuite';
import firebase from 'firebase/app';
import { useParams } from 'react-router';
import { database } from '../../../misc/firebase';
import { useProfile } from '../../../context/profile.context';

function assembleMessage(profile, chatId) {
    return {
        roomId: chatId,
        author: {
            name: profile.name,
            uid: profile.id,
            createdAt: profile.createdAt,
            ...(profile.avatar ? { avatar: profile.avatar } : {}),
        },
        createdAt: firebase.database.ServerValue.TIMESTAMP,
    };
}

const ChatBottom = () => {
    const [input, setInput] = useState('');
    const { profile } = useProfile();
    const { chatId } = useParams();
    const [isLoading, setIsLoading] = useState(false);

    const onInputChange = useCallback(value => {
        setInput(value);
    }, []);

    const onSendClick = async () => {
        if (input.trim() === '') {
            return;
        }
        const msgData = assembleMessage(profile, chatId);
        msgData.text = input;

        const updates = {};
        const messageId = database.ref('messages').push().key;
        updates[`/messages/${messageId}`] = msgData;
        updates[`/rooms/${chatId}/lastMessage`] = {
            ...msgData,
            msgId: messageId,
        };
        setIsLoading(true);
        try {
            await database.ref().update(updates);
            setInput('');
            setIsLoading(false);
        } catch (error) {
            Alert.error(error.message);
            setIsLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault()
            onSendClick()
        }
    }

    return (
        <div>
            <InputGroup>
                <Input
                    value={input}
                    onChange={onInputChange}
                    placeholder="Write a new message here ..."
                    onKeyDown={onKeyDown}
                />
                <InputGroup.Button
                    disabled={isLoading}
                    color="blue"
                    appearance="primary"
                    onClick={onSendClick}
                >
                    <Icon icon="send" />
                </InputGroup.Button>
            </InputGroup>
        </div>
    );
};

export default ChatBottom;
