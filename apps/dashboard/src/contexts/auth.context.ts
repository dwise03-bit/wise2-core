// Auth Context Stub
// This is a placeholder for the auth context
// Implement with your actual auth solution

export const useAuth = () => {
  return {
    token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false,
    user: null,
    login: async () => {},
    logout: () => localStorage.removeItem('auth_token'),
  };
};
