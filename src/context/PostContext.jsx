import React, { createContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

export const PostContext = createContext();

const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
console.log('Connecting to socket server:', SOCKET_SERVER_URL);

const socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
});

export const PostContextProvider = ({ children }) => {
    const [code, setCode] = useState("");
    const [joinedUsers, setJoinedUsers] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [isConnected, setIsConnected] = useState(socket.connected);

    const handleConnect = useCallback(() => {
        console.log('Socket connected in PostContext');
        setIsConnected(true);
        toast.success('Connected to the server');
    }, []);

    const handleDisconnect = useCallback(() => {
        console.log('Socket disconnected in PostContext');
        setIsConnected(false);
        toast.error('Disconnected from the server. Attempting to reconnect...');
    }, []);

    const handleConnectError = useCallback((error) => {
        console.error('Socket connection error in PostContext:', error);
        setIsConnected(false);
        toast.error('Failed to connect to the server. Retrying...');
    }, []);

    useEffect(() => {
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);

        // Add more event listeners for debugging
        socket.on('error', (error) => console.error('Socket error:', error));
        socket.on('reconnect', (attemptNumber) => console.log('Socket reconnected after', attemptNumber, 'attempts'));
        socket.on('reconnect_error', (error) => console.error('Socket reconnection error:', error));

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('error');
            socket.off('reconnect');
            socket.off('reconnect_error');
        };
    }, [handleConnect, handleDisconnect, handleConnectError]);

    return (
        <PostContext.Provider
            value={{
                code,
                setCode,
                joinedUsers,
                setJoinedUsers,
                selectedLanguage,
                setSelectedLanguage,
                socket,
                isConnected,
            }}
        >
            {children}
        </PostContext.Provider>
    );
};