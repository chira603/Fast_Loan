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
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification, 3: Registration
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

  // Handle form submission (Step 1)
  const handleFormSubmit = async (values) => {
    setIsLoading(true);
    try {
      setFormData(values);
      
      // Send email OTP
      await sendEmailOTP(values.email, values.full_name);
      toast.success('OTP sent to your email!');
      setOtpSent(prev => ({ ...prev, email: true }));
      startResendTimer('email');

      // Send SMS OTP if phone is provided
      if (values.phone) {
        await sendSmsOTP(values.phone);
        toast.success('OTP sent to your phone!');
        setOtpSent(prev => ({ ...prev, phone: true }));
        startResendTimer('phone');
      }

      setStep(2); // Move to OTP verification
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify email OTP
  const handleVerifyEmailOTP = async () => {
    if (!emailOTP || emailOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmailOTP(formData.email, emailOTP);
      setEmailVerified(true);
      toast.success('Email verified successfully!');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify phone OTP
  const handleVerifyPhoneOTP = async () => {
    if (!phoneOTP || phoneOTP.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await verifySmsOTP(formData.phone, phoneOTP);
      setPhoneVerified(true);
      toast.success('Phone verified successfully!');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend email OTP
  const handleResendEmailOTP = async () => {
    setIsLoading(true);
    try {
      await resendEmailOTP(formData.email, formData.full_name);
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
  const handleResendPhoneOTP = async () => {
    setIsLoading(true);
    try {
      await resendSmsOTP(formData.phone);
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
  const handleCompleteRegistration = async () => {
    if (!emailVerified) {
      toast.error('Please verify your email first');
      return;
    }

    if (formData.phone && !phoneVerified) {
      toast.error('Please verify your phone number first');
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await register({
        ...userData,
        emailVerified: true,
        phoneVerified: formData.phone ? true : undefined,
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

  // Render Step 1: Registration Form
  if (step === 1) {
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
              onSubmit={handleFormSubmit}
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">
                        <FaEnvelope className="inline mr-2" />
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        className="input-field"
                        placeholder="john@example.com"
                      />
                      <ErrorMessage name="email" component="div" className="error-message" />
                    </div>

                    <div>
                      <label className="label">
                        <FaPhone className="inline mr-2" />
                        Phone (Optional)
                      </label>
                      <Field
                        type="tel"
                        name="phone"
                        className="input-field"
                        placeholder="+91 98765 43210"
                      />
                      <ErrorMessage name="phone" component="div" className="error-message" />
                    </div>
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
                    disabled={!isValid || !dirty || isLoading}
                  >
                    {isLoading ? 'Sending OTP...' : 'Continue to Verification'}
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
  }

  // Render Step 2: OTP Verification
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">Verify Your Details</h1>
          <p className="text-neutral-600">We've sent OTP codes to verify your information</p>
        </div>

        <div className="card space-y-6">
          {/* Email OTP Section */}
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-800">Email Verification</h3>
              {emailVerified ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : (
                <FaClock className="text-orange-500 text-xl" />
              )}
            </div>
            
            <p className="text-sm text-neutral-600 mb-3">
              OTP sent to: <strong>{formData?.email}</strong>
            </p>

            {!emailVerified && (
              <>
                <input
                  type="text"
                  value={emailOTP}
                  onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="input-field mb-3"
                  maxLength="6"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleVerifyEmailOTP}
                    className="btn-primary flex-1"
                    disabled={isLoading || emailOTP.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                  
                  <button
                    onClick={handleResendEmailOTP}
                    className="btn-secondary"
                    disabled={isLoading || resendTimer.email > 0}
                  >
                    {resendTimer.email > 0 ? `${resendTimer.email}s` : 'Resend'}
                  </button>
                </div>
              </>
            )}

            {emailVerified && (
              <div className="text-green-600 font-medium flex items-center">
                <FaCheckCircle className="mr-2" />
                Email verified successfully!
              </div>
            )}
          </div>

          {/* Phone OTP Section (if phone provided) */}
          {formData?.phone && (
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-neutral-800">Phone Verification</h3>
                {phoneVerified ? (
                  <FaCheckCircle className="text-green-500 text-xl" />
                ) : (
                  <FaClock className="text-orange-500 text-xl" />
                )}
              </div>
              
              <p className="text-sm text-neutral-600 mb-3">
                OTP sent to: <strong>{formData?.phone}</strong>
              </p>

              {!phoneVerified && (
                <>
                  <input
                    type="text"
                    value={phoneOTP}
                    onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="input-field mb-3"
                    maxLength="6"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleVerifyPhoneOTP}
                      className="btn-primary flex-1"
                      disabled={isLoading || phoneOTP.length !== 6}
                    >
                      {isLoading ? 'Verifying...' : 'Verify Phone'}
                    </button>
                    
                    <button
                      onClick={handleResendPhoneOTP}
                      className="btn-secondary"
                      disabled={isLoading || resendTimer.phone > 0}
                    >
                      {resendTimer.phone > 0 ? `${resendTimer.phone}s` : 'Resend'}
                    </button>
                  </div>
                </>
              )}

              {phoneVerified && (
                <div className="text-green-600 font-medium flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Phone verified successfully!
                </div>
              )}
            </div>
          )}

          {/* Complete Registration Button */}
          <div className="pt-4">
            <button
              onClick={handleCompleteRegistration}
              className="btn-primary w-full"
              disabled={!emailVerified || (formData?.phone && !phoneVerified) || isLoading}
            >
              {isLoading ? 'Completing Registration...' : 'Complete Registration'}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setStep(1)}
              className="text-neutral-600 hover:text-primary-500 text-sm"
            >
              ← Back to form
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📧 Check your inbox</h4>
          <p className="text-sm text-blue-800">
            If you don't receive the OTP within 2 minutes, check your spam folder or click resend.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
