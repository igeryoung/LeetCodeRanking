import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMe } from '../api/auth';
import { setAccessToken } from '../api/client';

export function CallbackPage() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/?error=auth_failed');
      return;
    }

    setAccessToken(token);
    fetchMe()
      .then(({ user }) => {
        login(token, user);
        navigate('/');
      })
      .catch(() => navigate('/?error=auth_failed'));
  }, []); // eslint-disable-line

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Signing in…</p>
      </div>
    </div>
  );
}
