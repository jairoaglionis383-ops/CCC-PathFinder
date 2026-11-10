import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { login } from '../../services/adminAuthService';
import { ROUTES } from '../../constants/routes';

// AdminLoginPage - real controlled form wired to the existing
// POST /api/v1/admin/auth/login contract (email + password in,
// { token, admin } out - see auth.controller.js/adminAuth.validator.js).
// No Axios/apiClient call happens here directly; adminAuthService.login()
// makes the request AND persists the token, so this page only reacts
// to success/failure.
const INITIAL_FORM = { email: '', password: '' };

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      await login(form.email, form.password);
      navigate(ROUTES.adminReports);
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }

  return (
    <div className="max-w-sm mx-auto flex flex-col gap-6 py-8">
      <div className="text-center">
        <h1 className="text-h1 text-navy mb-1">Admin Login</h1>
        <p className="text-small text-gray-dark">CCC PathFinder administration</p>
      </div>

      <Card padding="p-6">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="admin@ccc.edu.ph"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {status === 'error' && (
            <p className="text-small text-navy font-medium" role="alert">
              {error?.message || 'Login failed. Please check your credentials and try again.'}
            </p>
          )}

          <Button type="submit" fullWidth disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Logging in…' : 'Log In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
