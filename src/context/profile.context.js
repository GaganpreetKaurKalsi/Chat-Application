/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useEffect } from 'react';
import firebase from 'firebase/app';
import { auth, database } from '../misc/firebase';

// const uid = auth.currentUser.uid;

export const isOfflineForDatabase = {
    state: 'offline',
    last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
    state: 'online',
    last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const ProfileContext = createContext();
export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let userRef;
        let userStatusRef;
        const authUnsub = auth.onAuthStateChanged(authObj => {
            if (authObj) {
                userStatusRef = database.ref(`/status/${authObj.uid}`);
                console.log('Auth Object Changed');
                userRef = database.ref(`/profiles/${authObj.uid}`);

                userRef.on('value', snapshot => {
                    const { name, createdAt, avatar } = snapshot.val();

                    const data = {
                        name,
                        createdAt,
                        avatar,
                        id: authObj.uid,
                        email: authObj.email,
                    };
                    setProfile(data);
                    setIsLoading(false);
                });

                // Create a reference to this user's specific status node.
                // This is where we will store data about being online/offline.

                database.ref('.info/connected').on('value', snapshot => {
                    // If we're not currently connected, don't do anything.
                    if (!!snapshot.val() === false) {
                        return;
                    }

                    // If we are currently connected, then use the 'onDisconnect()'
                    // method to add a set which will only trigger once this
                    // client has disconnected by closing the app,
                    // losing internet, or any other means.
                    userStatusRef
                        .onDisconnect()
                        .set(isOfflineForDatabase)
                        .then(() => {
                            // The promise returned from .onDisconnect().set() will
                            // resolve as soon as the server acknowledges the onDisconnect()
                            // request, NOT once we've actually disconnected:
                            // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

                            // We can now safely set ourselves as 'online' knowing that the
                            // server will mark us as offline once we lose connection.
                            userStatusRef.set(isOnlineForDatabase);
                        });
                });
            } else {
                if (userRef) {
                    userRef.off();
                }
                if (userStatusRef) {
                    userStatusRef.off();
                }
                database.ref('.info/connected').off();
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => {
            authUnsub();
            database.ref('.info/connected').off();
            if (userRef) {
                userRef.off();
            }
            if (userStatusRef) {
                userStatusRef.off();
            }
        };
    }, []);
    return (
        <ProfileContext.Provider value={{ isLoading, profile }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => useContext(ProfileContext);
