/* eslint-disable no-unused-vars */
import React, { useCallback, useState } from 'react';
import { Icon, Input, InputGroup, Alert } from 'rsuite';
import firebase from 'firebase/app';
import { useParams } from 'react-router';
import { database } from '../../../misc/firebase';
import { useProfile } from '../../../context/profile.context';
import AttachmentBtnModal from './AttachmentBtnModal';
import AudioMsgBtn from './AudioMsgBtn';

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
        likeCount : 0,
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

    const afterUpload = useCallback(async (files) => {
        setIsLoading(true)
        const updates = {};
        files.forEach(file => {
            const msgData = assembleMessage(profile, chatId)
            msgData.file = file;
            const messageId = database.ref('messages').push().key;
            updates[`/messages/${messageId}`] = msgData;
        })
        console.log(updates)
        const lastMsgId = Object.keys(updates).pop()
        updates[`/rooms/${chatId}/lastMessage`] = {
            ...updates[lastMsgId],
            msgId: lastMsgId,
        }


        try {
            await database.ref().update(updates)
            setIsLoading(false)
            
        } catch (error) {
            setIsLoading(false)
            Alert.error(error.message)
        }


    }, [chatId, profile])

    return (
        <div>
            <InputGroup>
                <AttachmentBtnModal afterUpload={afterUpload} />
                <AudioMsgBtn afterUpload={afterUpload} />
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
