import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001'; // Your backend server URL

interface ISocketContext {
    socket: Socket | null;
    isConnected: boolean;
}

// Ensure SocketContext is explicitly exported if the linter is missing it.
const SocketContextValue = createContext<ISocketContext | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContextValue); // Use the renamed const
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL, {
            // autoConnect: false, // You might want to connect manually later
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Clean up the socket connection when the provider unmounts
        return () => {
            newSocket.disconnect();
            setIsConnected(false);
        };
    }, []);

    return (
        <SocketContextValue.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContextValue.Provider>
    );
};

// Explicitly export the context itself
export { SocketContextValue as SocketContext }; 