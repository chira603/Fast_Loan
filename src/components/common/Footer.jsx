import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-primary-500 mb-4">FAST LOAN</h3>
            <p className="text-neutral-300 text-sm mb-4">
              Quick personal loans up to $5,000 with competitive rates and fast approval. Your trusted financial partner.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                <FaFacebookF />
              </a>
              <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/loan/apply" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Apply for Loan
                </Link>
              </li>
              <li>
                <Link to="/recharge" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Recharge
                </Link>
              </li>
              <li>
                <Link to="/bills" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Pay Bills
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>Email: support@fastloan.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Financial St,<br />City, State 12345</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
          <p className="text-sm text-neutral-400">
            © {currentYear} FAST LOAN. All rights reserved. | Designed for secure and responsible lending.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
