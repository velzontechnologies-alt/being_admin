import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const extractUserInfo = (obj) => {
    let result = {};
    const search = (item) => {
        if (!item || typeof item !== 'object') return;

        if ('token' in item && item.token) result.token = item.token;
        if ('email' in item && item.email) result.email = item.email;
        if ('role' in item && item.role) result.role = item.role;

        if ('name' in item && item.name) result.name = item.name;
        if ('Name' in item && item.Name) result.name = item.Name;

        if ('phone_number' in item && item.phone_number) result.phone_number = item.phone_number;
        if ('phone' in item && item.phone) result.phone_number = item.phone;

        if ('description' in item && item.description) result.description = item.description;
        if ('bio' in item && item.bio) result.description = item.bio;

        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                search(item[key]);
            }
        }
    };
    search(obj);
    return result;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = authService.getUser();
        if (savedUser) {
            const extracted = extractUserInfo(savedUser);
            const processedUser = { ...savedUser, ...extracted };

            // Check if we migrated new keys that weren't directly on the root of savedUser
            const hasNewRootKeys = Object.keys(extracted).some(
                key => extracted[key] && savedUser[key] !== extracted[key]
            );

            if (hasNewRootKeys) {
                localStorage.setItem('user', JSON.stringify(processedUser));
            }
            setUser(processedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const userData = await authService.login(email, password);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const refreshUser = () => {
        const savedUser = authService.getUser();
        setUser(savedUser);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
