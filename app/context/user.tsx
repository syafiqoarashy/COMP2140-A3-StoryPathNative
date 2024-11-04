import { createContext, useContext, useState } from 'react';

type UserContextType = {
    username: string | null;
    setUsername: (name: string) => void;
    profileImage: string | null;
    setProfileImage: (uri: string) => void;
    logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider component provides user-related data and actions
 * through React Context to its children.
 * @param children - The child components that can access the UserContext.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
    const [username, setUsername] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    /**
     * Function to log the user out by clearing username and profile image.
     */
    const logout = () => {
        setUsername(null);
        setProfileImage(null);
    };

    return (
        <UserContext.Provider
            value={{
                username,
                setUsername,
                profileImage,
                setProfileImage,
                logout
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

/**
 * Custom hook to access the UserContext.
 * Throws an error if used outside of a UserProvider.
 * @returns The user context object containing user data and actions.
 */
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
