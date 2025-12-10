import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { registerSchema } from '../utils/validators';
import { register, sendEmailOTP, sendSmsOTP, verifyEmailOTP, verifySmsOTP, resendEmailOTP, resendSmsOTP } from '../services/authService';
import { setUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  // Inline OTP verification within the form (no separate step)
  const [formData, setFormData] = useState(null);
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState({ email: false, phone: false });
  const [resendTimer, setResendTimer] = useState({ email: 0, phone: 0 });

  // Start countdown for resend button
  const startResendTimer = (type) => {
    setResendTimer(prev => ({ ...prev, [type]: 60 }));
    const interval = setInterval(() => {
      setResendTimer(prev => {
        const newTime = prev[type] - 1;
        if (newTime <= 0) {
          clearInterval(interval);
          return { ...prev, [type]: 0 };
        }
        return { ...prev, [type]: newTime };
      });
    }, 1000);
  };

  // Trigger send email OTP
  const handleSendEmailOTP = async (values) => {
    if (!values?.email) {
      toast.error('Enter a valid email first');
      return;
    }
    setIsLoading(true);
    try {
      await sendEmailOTP(values.email, values.full_name);
      setFormData(values);
      toast.success('OTP sent to your email! (valid for 1 minute)');
      setOtpSent(prev => ({ ...prev, email: true }));
      startResendTimer('email');
    } catch (error) {
      toast.error(error.message || 'Failed to send email OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger send phone OTP
  const handleSendPhoneOTP = async (values) => {
    if (!values?.phone) {
      toast.error('Enter a valid phone number first');
      return;
    }
    setIsLoading(true);
    try {
      await sendSmsOTP(values.phone);
      setFormData(values);
      toast.success('OTP sent to your phone! (valid for 1 minute)');
      setOtpSent(prev => ({ ...prev, phone: true }));
      startResendTimer('phone');
    } catch (error) {
      toast.error(error.message || 'Failed to send phone OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email OTP
  const handleVerifyEmailOTP = async (values) => {
    if (!emailOTP || emailOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const emailToVerify = values?.email || formData?.email;
      await verifyEmailOTP(emailToVerify, emailOTP);
      setEmailVerified(true);
      toast.success('Email verified successfully!');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify phone OTP
  const handleVerifyPhoneOTP = async (values) => {
    if (!phoneOTP || phoneOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const phoneToVerify = values?.phone || formData?.phone;
      await verifySmsOTP(phoneToVerify, phoneOTP);
      setPhoneVerified(true);
      toast.success('Phone verified successfully!');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend email OTP
  const handleResendEmailOTP = async (values) => {
    setIsLoading(true);
    try {
      const emailToResend = values?.email || formData?.email;
      const nameToUse = values?.full_name || formData?.full_name;
      await resendEmailOTP(emailToResend, nameToUse);
      toast.success('New OTP sent to your email!');
      startResendTimer('email');
      setEmailOTP('');
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend phone OTP
  const handleResendPhoneOTP = async (values) => {
    setIsLoading(true);
    try {
      const phoneToResend = values?.phone || formData?.phone;
      await resendSmsOTP(phoneToResend);
      toast.success('New OTP sent to your phone!');
      startResendTimer('phone');
      setPhoneOTP('');
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete registration
  const handleCompleteRegistration = async (values) => {
    if (!emailVerified) {
      toast.error('Please verify your email first');
      return;
    }

    if (values?.phone && !phoneVerified) {
      toast.error('Please verify your phone number first');
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = values || formData;
      const response = await register({
        ...userData,
        emailVerified: true,
        phoneVerified: values?.phone ? phoneVerified : undefined,
      });
      
      const user = response.data.user;
      dispatch(setUser(user));
      toast.success('Registration successful! Welcome to Fast Loan!');
      
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

  // Render: Single-step registration with inline OTP verification for email and phone
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">Create Account</h1>
          <p className="text-neutral-600">Join Fast Loan today</p>
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
            onSubmit={handleCompleteRegistration}
          >
            {({ isValid, dirty, values }) => (
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

                {/* Email Field with OTP - Full Width */}
                <div>
                  <label className="label flex items-center justify-between">
                    <span><FaEnvelope className="inline mr-2" /> Email</span>
                    {emailVerified && (
                      <span className="text-green-600 flex items-center text-sm"><FaCheckCircle className="mr-1" /> Verified</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <Field
                      type="email"
                      name="email"
                      className="input-field flex-1"
                      placeholder="john@example.com"
                    />
                    <button
                      type="button"
                      className="btn-secondary whitespace-nowrap px-4"
                      disabled={isLoading || resendTimer.email > 0 || !values.email}
                      onClick={() => handleSendEmailOTP(values)}
                    >
                      {resendTimer.email > 0 ? `${resendTimer.email}s` : 'Send OTP'}
                    </button>
                  </div>
                  <ErrorMessage name="email" component="div" className="error-message" />

                  {/* Email OTP Verification Row */}
                  {otpSent.email && !emailVerified && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={emailOTP}
                        onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="input-field flex-1"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        className="btn-primary whitespace-nowrap px-4"
                        disabled={isLoading || emailOTP.length !== 6}
                        onClick={() => handleVerifyEmailOTP(values)}
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        className="btn-outline whitespace-nowrap px-3"
                        disabled={isLoading || resendTimer.email > 0}
                        onClick={() => handleResendEmailOTP(values)}
                      >
                        Resend
                      </button>
                    </div>
                  )}
                </div>

                {/* Phone Field with OTP */}
                <div>
                  <label className="label flex items-center justify-between">
                    <span><FaPhone className="inline mr-2" /> Phone (Optional)</span>
                    {phoneVerified && (
                      <span className="text-green-600 flex items-center text-sm"><FaCheckCircle className="mr-1" /> Verified</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <Field
                      type="tel"
                      name="phone"
                      className="input-field flex-1"
                      placeholder="+91 98765 43210"
                    />
                    <button
                      type="button"
                      className="btn-secondary whitespace-nowrap px-4"
                      disabled={isLoading || !values.phone || resendTimer.phone > 0}
                      onClick={() => handleSendPhoneOTP(values)}
                    >
                      {resendTimer.phone > 0 ? `${resendTimer.phone}s` : 'Send OTP'}
                    </button>
                  </div>
                  <ErrorMessage name="phone" component="div" className="error-message" />

                  {/* Phone OTP Verification Row */}
                  {otpSent.phone && !phoneVerified && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={phoneOTP}
                        onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        className="input-field flex-1"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        className="btn-primary whitespace-nowrap px-4"
                        disabled={isLoading || phoneOTP.length !== 6}
                        onClick={() => handleVerifyPhoneOTP(values)}
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        className="btn-outline whitespace-nowrap px-3"
                        disabled={isLoading || resendTimer.phone > 0}
                        onClick={() => handleResendPhoneOTP(values)}
                      >
                        Resend
                      </button>
                    </div>
                  )}
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

                <div>
                  <label className="label">
                    <FaMapMarkerAlt className="inline mr-2" />
                    Address (Optional)
                  </label>
                  <Field
                    as="textarea"
                    name="address"
                    rows="3"
                    className="input-field"
                    placeholder="123 Main St, City, State, PIN"
                  />
                  <ErrorMessage name="address" component="div" className="error-message" />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={!isValid || !dirty || isLoading || !emailVerified || (!!values.phone && !phoneVerified)}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-500 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
