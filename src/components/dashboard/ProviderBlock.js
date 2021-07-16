/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Alert, Button, Icon, Tag } from 'rsuite';
import firebase from 'firebase/app';
import { auth } from '../../misc/firebase';

const ProviderBlock = () => {
    console.log(
        auth.currentUser.providerData.some(
            provider => provider.providerId === 'google.com'
        )
    );

    const [isConnected, setIsConnected] = useState({
        'google.com': auth.currentUser.providerData.some(
            provider => provider.providerId === 'google.com'
        ),

        'facebook.com': auth.currentUser.providerData.some(
            provider => provider.providerId === 'facebook.com'
        ),
    });

    const updateIsConnected = (providerId, state) => {
        setIsConnected(prev => {
            return {
                ...prev,
                [providerId] : state,
            }
        });
    }
    const unlink = async providerId => {
        try {
            if (auth.currentUser.providerData.length === 1) {
                throw new Error(`You cannot disconnect from ${providerId}`)
            }
            await auth.currentUser.unlink(providerId)
            updateIsConnected(providerId, false)
            Alert.info(`Disconnected from ${providerId}`, 4000)
        } catch (error) {
            Alert.error(error.message, 4000)
        }
        
    };

    const link = async provider => {
        try {
            await auth.currentUser.linkWithPopup(provider);
            updateIsConnected(provider.providerId, true);
            Alert.info(`Linked to ${provider.providerId}`, 4000)
            console.log(auth.currentUser.providerData)
        } catch (error) {
            Alert.error(error.message, 4000);
        }
    }
    const unLinkFacebook = () => {
        unlink('facebook.com');
    };
    const unLinkGoogle = () => {
        unlink('google.com');
    };

    const linkFacebook = () => {
        link(new firebase.auth.FacebookAuthProvider());
    };

    const linkGoogle = () => {
        link(new firebase.auth.GoogleAuthProvider());
    };

    return (
        <div className="mt-3">
            {isConnected['google.com'] && (
                <Tag closable color="green" onClose={unLinkGoogle}>
                    <Icon icon="google" /> Connected
                </Tag>
            )}

            {isConnected['facebook.com'] && (
                <Tag closable color="blue" onClose={unLinkFacebook}>
                    <Icon icon="facebook" /> Connected
                </Tag>
            )}

            <div className="mt-2">
                {!isConnected['google.com'] && (
                    <Button block color="green" onClick={linkGoogle}>
                        <Icon icon="google" /> Link to Google
                    </Button>
                )}

                {!isConnected['facebook.com'] && (
                    <Button block color="blue"  onClick={linkFacebook}>
                        <Icon icon="facebook" /> Link to Facebook
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ProviderBlock;
