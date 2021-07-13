import React from 'react';
import { Button, Divider, Drawer, Alert } from 'rsuite';
import { useProfile } from '../../context/profile.context';
import { database } from '../../misc/firebase';
import EditableInput from '../EditableInput';

const Dashboard = ({ onSignOut }) => {
    const { profile } = useProfile();

    const onSave = async(name) => {
        const { id } = profile;
        const userNicknameRef = database.ref(`/profiles/${id}`).child('name');

        try {
            await userNicknameRef.set(name);
            Alert.success('Nickname has been updated', 4000)
        }
        catch (err) {
            Alert.error(err.message, 4000)
        }
    };

    return (
        <>
            <Drawer.Header>
                <Drawer.Title>Dashboard</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
                <h3>Hey, {profile.name}</h3>
                <Divider />
                <EditableInput
                    name="nickname"
                    initialValue={profile.name}
                    onSave={onSave}
                    label={<h6 className="mb-2">Nickname</h6>}
                />
            </Drawer.Body>

            <Drawer.Footer>
                <Button block color="red" onClick={onSignOut}>
                    Sign Out
                </Button>
            </Drawer.Footer>
        </>
    );
};

export default Dashboard;
