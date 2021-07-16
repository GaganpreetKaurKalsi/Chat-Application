import React, { createContext, useEffect, useState, useContext } from 'react';
import { database } from '../misc/firebase';
import { transformToArrayWithId } from '../misc/helpers';

const RoomsContext = createContext();

export const RoomsProvider = ({ children }) => {
    const [rooms, setRooms] = useState(null);

    useEffect(() => {
        const roomListRef = database.ref('rooms');

        roomListRef.on('value', snap => {
            const data = transformToArrayWithId(snap.val());
            setRooms(data);
            console.log(rooms)
        });

        return () => {
            roomListRef.off();
        };
    }, [rooms]);

    return (
        <RoomsContext.Provider value={rooms}>{children}</RoomsContext.Provider>
    );
};

export const useRooms = () => (
    useContext(RoomsContext)
)
