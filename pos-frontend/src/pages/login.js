import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100 p-3"
      style={{
        background: 'linear-gradient(135deg,#667eea,#764ba2)',
      }}
    >
      <div
        className="card shadow-lg border-0 p-4"
        style={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '15px',
        }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold">POS Cloud</h3>
          <p className="text-muted small">
            Login untuk mengakses dashboard kasir
          </p>
        </div>

        {error && (
          <div className="alert alert-danger text-center">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
            style={{ borderRadius: '8px' }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <hr />

        <div className="text-center">
          <p className="text-muted small mb-2">Belum punya akun?</p>
          <a
            href="https://wa.me/6287745745230"
            target="_blank"
            rel="noreferrer"
            className="btn btn-success w-100"
            style={{ borderRadius: '8px' }}
          >
            Trial / Berlangganan via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;