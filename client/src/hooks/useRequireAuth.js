import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to handle authentication requirements
 * @param {Object} options - Configuration options
 * @param {string} [options.redirectPath='/login'] - Path to redirect to if not authenticated
 * @param {string} [options.redirectMessage] - Message to show on the login page
 * @returns {Object} - Authentication utilities
 */
const useRequireAuth = (options = {}) => {
    const { redirectPath = '/login', redirectMessage } = options;
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Require authentication for a specific action
     * @param {Function} callback - Function to execute if authenticated
     * @returns {Function} - Wrapped function that checks authentication
     */
    const requireAuth = useCallback((callback) => {
        return (...args) => {
            if (!isAuthenticated) {
                navigate(redirectPath, {
                    state: { 
                        from: location.pathname,
                        message: redirectMessage
                    },
                    replace: true
                });
                return null;
            }
            return callback(...args);
        };
    }, [isAuthenticated, navigate, redirectPath, redirectMessage, location.pathname]);

    /**
     * Redirect to login with a message
     * @param {string} message - Message to display on the login page
     */
    const redirectToLogin = useCallback((message) => {
        navigate(redirectPath, {
            state: { 
                from: location.pathname,
                message: message || redirectMessage
            },
            replace: true
        });
    }, [navigate, redirectPath, redirectMessage, location.pathname]);

    return {
        isAuthenticated,
        requireAuth,
        redirectToLogin
    };
};

export default useRequireAuth;

/**
 * Higher-Order Component for protecting routes
 * @param {React.Component} Component - Component to protect
 * @returns {React.Component} - Protected component
 */
export const withAuth = (Component) => {
    const WrappedComponent = (props) => {
        const { isAuthenticated } = useAuth();
        const location = useLocation();
        const navigate = useNavigate();

        if (!isAuthenticated) {
            navigate('/login', {
                state: { from: location.pathname },
                replace: true
            });
            return null;
        }

        return <Component {...props} />;
    };

    // Set display name for better debugging
    WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
    
    return WrappedComponent;
};
