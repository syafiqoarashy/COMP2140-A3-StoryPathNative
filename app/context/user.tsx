import { createContext, useContext, useState } from 'react';

type UserContextType = {
    username: string | null;
    setUsername: (name: string) => void;
    profileImage: string | null;
    setProfileImage: (uri: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [username, setUsername] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    return (
        <UserContext.Provider
            value={{
                username,
                setUsername,
                profileImage,
                setProfileImage
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}