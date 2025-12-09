import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginSchema } from '../utils/validators';
import { login } from '../services/authService';
import { setUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await login(values);
      const user = response.data.user;
      dispatch(setUser(user));
      toast.success('Login successful!');
      // Redirect based on role
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">Welcome Back</h1>
          <p className="text-neutral-600">Login to access your account</p>
        </div>

        <div className="card">
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty }) => (
              <Form className="space-y-6">
                <div>
                  <label className="label">
                    <FaEnvelope className="inline mr-2" />
                    Email Address
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className="input-field"
                    placeholder="you@example.com"
                  />
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div>
                  <label className="label">
                    <FaLock className="inline mr-2" />
                    Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    className="input-field"
                    placeholder="••••••••"
                  />
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-neutral-600">Remember me</span>
                  </label>
                  <a href="#" className="text-primary-500 hover:text-primary-600">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={!isValid || !dirty || isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
