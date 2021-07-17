/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Alert, Button, Loader, Modal, Container } from 'rsuite';
import { useProfile } from '../../context/profile.context';
import { useModalState } from '../../misc/custom-hooks';
import { database, storage } from '../../misc/firebase';
import { getUserUpdates } from '../../misc/helpers';
import ProfileAvatar from './ProfileAvatar';

const fileInputTypes = '.png, .jpeg, .jpg';
const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/pjpeg'];
const isValidFile = file => {
    return acceptedFileTypes.includes(file.type);
};

const getBlob = canvas => {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('File process error'));
            }
        });
    });
};

const AvatarUploadBtn = () => {
    const { isOpen, close, open } = useModalState();
    const [img, setImg] = useState(null);
    const AvatarEditorRef = useRef();
    const { profile } = useProfile();
    const [isLoading, setIsLoading] = useState(false);
    const onFileInputChange = ev => {
        const currFiles = ev.target.files;

        if (currFiles.length === 1) {
            const file = currFiles[0];
            if (isValidFile(file)) {
                setImg(file);
                open();
            } else {
                Alert.warning(`Wrong file type ${file.type}`, 4000);
            }
        }
    };

    const onUploadClick = async () => {
        const canvas = AvatarEditorRef.current.getImageScaledToCanvas();
        setIsLoading(true);
        try {
            const blob = await getBlob(canvas);
            const avatarFileRef = storage
                .ref(`/profile/${profile.id}`)
                .child('avatar');

            const uploadAvatarResult = await avatarFileRef.put(blob, {
                cacheControl: `public, max-age=${3600 * 24 * 3}`,
            });

            const downloadUrl = await uploadAvatarResult.ref.getDownloadURL();
            const updates = await getUserUpdates(
                profile.id,
                'avatar',
                downloadUrl,
                database
            );
            await database.ref().update(updates);
            setIsLoading(false);

            Alert.info('Avatar has been uploaded', 4000);
            close();
        } catch (error) {
            Alert.error(error.message, 4000);
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-3 text-center">
            <ProfileAvatar
                src={profile.avatar}
                name={profile.name}
                className="width-200 height-200 img-fullsize font-huge"
            />

            <div>
                <label
                    htmlFor="avatar-upload"
                    className="d-block cursor-pointer padded"
                >
                    Select new avatar
                    <input
                        id="avatar-upload"
                        type="file"
                        className="d-none"
                        accept={fileInputTypes}
                        onChange={onFileInputChange}
                    />
                </label>

                <Modal show={isOpen} onHide={close}>
                    <Modal.Header>
                        <Modal.Title>Adjust and upload new Avatar</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="d-flex justify-content-center align-items-center h-100">
                            {img && (
                                <AvatarEditor
                                    ref={AvatarEditorRef}
                                    image={img}
                                    width={200}
                                    height={200}
                                    border={10}
                                    borderRadius={100}
                                    rotate={0}
                                />
                            )}
                        </div>
                        {isLoading && (
                            <Container>
                                <Loader
                                    center
                                    vertical
                                    size="md"
                                    content="Uploading in process"
                                    speed="slow"
                                />
                            </Container>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            block
                            appearance="ghost"
                            onClick={onUploadClick}
                            disabled={isLoading}
                        >
                            Upload new avatar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default AvatarUploadBtn;
