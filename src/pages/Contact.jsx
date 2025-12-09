import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { contactSchema } from '../utils/validators';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FaEnvelope, FaUser, FaComment } from 'react-icons/fa';

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    try {
      await api.post('/contact', values);
      toast.success('Message sent successfully! We will get back to you soon.');
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">Contact Us</h1>
          <p className="text-xl text-neutral-600">
            Have questions? We're here to help!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <Formik
              initialValues={{ name: '', email: '', message: '' }}
              validationSchema={contactSchema}
              onSubmit={handleSubmit}
            >
              {({ isValid, dirty }) => (
                <Form className="space-y-6">
                  <div>
                    <label className="label">
                      <FaUser className="inline mr-2" />
                      Name
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="input-field"
                      placeholder="Your name"
                    />
                    <ErrorMessage name="name" component="div" className="error-message" />
                  </div>

                  <div>
                    <label className="label">
                      <FaEnvelope className="inline mr-2" />
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="input-field"
                      placeholder="your@email.com"
                    />
                    <ErrorMessage name="email" component="div" className="error-message" />
                  </div>

                  <div>
                    <label className="label">
                      <FaComment className="inline mr-2" />
                      Message
                    </label>
                    <Field
                      as="textarea"
                      name="message"
                      className="input-field"
                      rows="5"
                      placeholder="How can we help you?"
                    />
                    <ErrorMessage name="message" component="div" className="error-message" />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled={!isValid || !dirty || isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {/* Contact Info */}
          <div>
            <div className="card mb-6">
              <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
              <div className="space-y-4 text-neutral-600">
                <div>
                  <p className="font-semibold text-neutral-800">Email</p>
                  <p>support@fastloan.com</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">Phone</p>
                  <p>+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">Address</p>
                  <p>123 Financial Street<br />City, State 12345<br />United States</p>
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">Business Hours</p>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div className="card bg-primary-50">
              <h3 className="text-xl font-bold mb-3 text-primary-700">Quick Support</h3>
              <p className="text-neutral-700 mb-4">
                For urgent matters, use our live chat or call us directly during business hours.
              </p>
              <button className="btn-primary">Start Live Chat</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
