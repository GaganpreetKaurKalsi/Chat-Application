/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, database } from '../misc/firebase';

const ProfileContext = createContext();
export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userRef;
    const authUnsub = auth.onAuthStateChanged(authObj => {
      if (authObj) {
        console.log("Auth Object Changed")
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
      } else {
          if (userRef) {
              userRef.off()
          }
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
        authUnsub();
        if (userRef) {
            userRef.off()
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
