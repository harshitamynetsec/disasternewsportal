import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../css/LoginForm.css';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate email domain
    if (!formData.email.endsWith('@mynetsec.com')) {
      setErrors({ general: 'Access restricted to @mynetsec.com email addresses only' });
      setIsLoading(false);
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setErrors({ general: error.message });
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="background-grid" />
      <div className="orb-1" />
      <div className="orb-2" />
      <div className="main-content">
        <div className="header">
          <h1 className="title">NSS Alert Portal</h1>
          {/* <p className="subtitle">Secure Access Portal</p> */}
        </div>
        <form className="form-panel" onSubmit={handleSubmit}>
          <h2 className="form-title">Sign In</h2>
          <div className="form-group">
            <label className="label">Email Address</label>
            <div className="input-container">
              <input
                type="email"
                name="email"
                autoComplete="username"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="username@mynetsec.com"
                className="input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="input password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="checkbox-container">
            <label className="checkbox-label">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#" className="forgot-link">
              Forgot password?
            </a>
          </div>
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <div className="spinner" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          <div className="demo-creds">
            <p>Demo Credentials:</p>
            <p>Email: demo@mynetsec.com</p>
            <p>Password: demo123</p>
          </div>
        </form>
        <div className="footer">
          <p className="status-text">
           Secure •  Monitored •  Protected
          </p>
          <div className="status-indicators">
            <div className="indicator">
              <div className="status-dot green" />
              System Online
            </div>
            {/* <div className="indicator">
              <div className="status-dot blue" />
              44/44 Alerts Mapped
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;