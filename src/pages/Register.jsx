import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { registerSchema } from '../utils/validators';
import { register } from '../services/authService';
import { setUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = values;
      const response = await register(userData);
      const user = response.data.user;
      dispatch(setUser(user));
      toast.success('Registration successful!');
      // Redirect based on role
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">Create Account</h1>
          <p className="text-neutral-600">Join FAST LOAN today</p>
        </div>

        <div className="card">
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              full_name: '',
              phone: '',
              address: '',
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty }) => (
              <Form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">
                      <FaUser className="inline mr-2" />
                      Username
                    </label>
                    <Field
                      type="text"
                      name="username"
                      className="input-field"
                      placeholder="johndoe"
                    />
                    <ErrorMessage name="username" component="div" className="error-message" />
                  </div>

                  <div>
                    <label className="label">
                      <FaUser className="inline mr-2" />
                      Full Name
                    </label>
                    <Field
                      type="text"
                      name="full_name"
                      className="input-field"
                      placeholder="John Doe"
                    />
                    <ErrorMessage name="full_name" component="div" className="error-message" />
                  </div>
                </div>

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
                    <FaPhone className="inline mr-2" />
                    Phone Number (Optional)
                  </label>
                  <Field
                    type="tel"
                    name="phone"
                    className="input-field"
                    placeholder="+1234567890"
                  />
                  <ErrorMessage name="phone" component="div" className="error-message" />
                </div>

                <div>
                  <label className="label">
                    <FaMapMarkerAlt className="inline mr-2" />
                    Address (Optional)
                  </label>
                  <Field
                    as="textarea"
                    name="address"
                    className="input-field"
                    rows="2"
                    placeholder="Your address"
                  />
                  <ErrorMessage name="address" component="div" className="error-message" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
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

                  <div>
                    <label className="label">
                      <FaLock className="inline mr-2" />
                      Confirm Password
                    </label>
                    <Field
                      type="password"
                      name="confirmPassword"
                      className="input-field"
                      placeholder="••••••••"
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" required />
                  <span className="text-neutral-600">
                    I agree to the{' '}
                    <a href="#" className="text-primary-500 hover:text-primary-600">
                      Terms & Conditions
                    </a>
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={!isValid || !dirty || isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
