import { authRepository$ } from '@/repositories';
import { RecoverUserRequest, RecoverUserResponse } from '@/repositories/schemas/auth.schema';
import { useState } from 'react';

interface UseUserRecoveryReturn {
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  recoverUser: (request: RecoverUserRequest) => Promise<RecoverUserResponse>;
}

export function useUserRecovery(): UseUserRecoveryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recoverUser = async (request: RecoverUserRequest): Promise<RecoverUserResponse> => {
    const repository = authRepository$();
    setIsLoading(true);
    setError(null);
    try {
      const response = await repository.recoverUser(request);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'No se pudo recuperar el usuario';
      setError(errorMessage);
      return { success: false, username: '', maskedEmail: '' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    recoverUser,
  };
}
