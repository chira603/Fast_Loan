import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCalculator, FaChartLine, FaLock, FaClock, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { calculateEMI, formatCurrency } from '../utils/emiCalculator';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [amount, setAmount] = useState(3000);
  const [tenure, setTenure] = useState(12);
  const [interestRate] = useState(parseFloat(import.meta.env.VITE_DEFAULT_INTEREST_RATE) || 12);

  const emiData = calculateEMI(amount, interestRate, tenure);

  const chartData = {
    labels: ['Principal', 'Interest'],
    datasets: [
      {
        data: [emiData.principal, emiData.totalInterest],
        backgroundColor: ['#007BFF', '#28A745'],
        borderColor: ['#0062cc', '#218838'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const features = [
    {
      icon: <FaClock className="text-4xl text-primary-500" />,
      title: 'Quick Approval',
      description: 'Get approved in as little as 24 hours with our streamlined process.',
    },
    {
      icon: <FaLock className="text-4xl text-primary-500" />,
      title: 'Secure & Safe',
      description: 'Bank-level encryption and security to protect your personal data.',
    },
    {
      icon: <FaChartLine className="text-4xl text-primary-500" />,
      title: 'Competitive Rates',
      description: 'Get the best interest rates and flexible loan options.',
    },
    {
      icon: <FaCheckCircle className="text-4xl text-primary-500" />,
      title: 'Flexible Repayment',
      description: 'Choose tenure from 3 to 36 months that suits your budget.',
    },
  ];

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">Get Fast Loans Up to $5,000</h1>
              <p className="text-xl mb-8 text-primary-50">
                Quick approval, low rates, and flexible repayment options. Your trusted financial partner.
              </p>
              <div className="flex space-x-4">
                {isAuthenticated ? (
                  <Link to="/loan/apply" className="bg-white text-primary-500 px-8 py-4 rounded-lg font-semibold hover:bg-neutral-100 transition-colors">
                    Apply Now
                  </Link>
                ) : (
                  <Link to="/register" className="bg-white text-primary-500 px-8 py-4 rounded-lg font-semibold hover:bg-neutral-100 transition-colors">
                    Get Started
                  </Link>
                )}
                <Link to="/contact" className="border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-500 transition-colors">
                  Contact Us
                </Link>
              </div>
              <div className="mt-8 flex items-center space-x-4">
                <FaShieldAlt className="text-3xl" />
                <span className="text-sm">Secure & Encrypted | GDPR Compliant</span>
              </div>
            </div>

            {/* EMI Calculator Card */}
            <div className="bg-white rounded-xl shadow-2xl p-8 text-neutral-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaCalculator className="mr-3 text-primary-500" />
                EMI Calculator
              </h2>

              <div className="mb-6">
                <label className="label">
                  Loan Amount: {formatCurrency(amount)}
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>$100</span>
                  <span>$5,000</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="label">
                  Tenure: {tenure} months
                </label>
                <input
                  type="range"
                  min="3"
                  max="36"
                  step="1"
                  value={tenure}
                  onChange={(e) => setTenure(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-neutral-500 mt-1">
                  <span>3 months</span>
                  <span>36 months</span>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-neutral-600 mb-2">Interest Rate</p>
                <p className="text-2xl font-bold text-primary-500">{interestRate}% p.a.</p>
              </div>

              <div className="bg-primary-50 rounded-lg p-6 mb-6">
                <p className="text-sm text-neutral-600 mb-2">Monthly EMI</p>
                <p className="text-4xl font-bold text-primary-700">{formatCurrency(emiData.emi)}</p>
              </div>

              <div className="h-48 mb-4">
                <Doughnut data={chartData} options={chartOptions} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-600">Principal</p>
                  <p className="font-semibold">{formatCurrency(emiData.principal)}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Interest</p>
                  <p className="font-semibold">{formatCurrency(emiData.totalInterest)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-600">Total Amount</p>
                  <p className="font-semibold text-lg">{formatCurrency(emiData.totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FAST LOAN?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-neutral-600 mb-8">
            Join thousands of satisfied customers who trust FAST LOAN
          </p>
          {isAuthenticated ? (
            <Link to="/loan/apply" className="btn-primary text-lg px-12 py-4">
              Apply for Loan Now
            </Link>
          ) : (
            <Link to="/register" className="btn-primary text-lg px-12 py-4">
              Register Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
