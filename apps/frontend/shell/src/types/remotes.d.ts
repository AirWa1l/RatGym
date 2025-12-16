declare module 'authMf/LoginPage' {
  const LoginPage: React.ComponentType<{
    onLoginSuccess?: () => void;
  }>;
  export default LoginPage;
}

declare module 'authMf/useAuth' {
  export function useAuth(): {
    user: any;
    loading: boolean;
    error: string | null;
    token: string | null;
    login: (username: string, password?: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
  };
}
