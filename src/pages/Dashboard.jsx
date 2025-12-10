import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaChartLine, FaFileInvoiceDollar, FaMobileAlt, FaBolt } from 'react-icons/fa';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';
import { toast } from 'react-toastify';
import { getLoanStatistics, getLoans } from '../services/loanService';
import { getPaymentsByUser } from '../services/paymentService';
import { formatCurrency } from '../utils/emiCalculator';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getLoanStatistics();
        setStats(s.data);
      } catch {}
      try {
        const l = await getLoans({ limit: 5 });
        setRecentLoans(l.data || []);
      } catch {}
      try {
        const p = await getPaymentsByUser();
        setPayments(p.data || []);
      } catch {}
    };
    load();
  }, []);

  const openPaymentModal = (service) => {
    setSelectedService(service);
    setShowPaymentModal(true);
  };

  const redirectToPaymentApp = (app) => {
    // UPI IDs for your business
    const upiIds = {
      phonepe: 'fastloan@ybl',
      googlepay: 'fastloan@okaxis',
      paytm: 'fastloan@paytm',
    };

    const serviceName = selectedService === 'recharge' ? 'Mobile Recharge' : 'Bill Payment';
    const amount = 100; // Default amount, can be customized
    
    const params = new URLSearchParams({
      pa: upiIds[app],
      pn: 'Fast Loan',
      am: amount.toString(),
      cu: 'INR',
      tn: serviceName,
    });

    const upiLink = `upi://pay?${params.toString()}`;
    
    // Redirect to UPI app
    window.location.href = upiLink;
    
    toast.info(`Redirecting to ${app.toUpperCase()}...`);
    setShowPaymentModal(false);
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          Welcome, {user?.full_name || user?.username}!
        </h1>
        <p className="text-neutral-600">Manage your loans and applications</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-neutral-600 text-sm mb-1">Active Loans</p>
              <h3 className="text-3xl font-bold text-primary-500">{stats ? (stats.approved_loans + stats.disbursed_loans) : 0}</h3>
            </div>
            <FaFileInvoiceDollar className="text-3xl text-primary-500" />
          </div>
          <p className="text-sm text-neutral-500">Total Amount: {formatCurrency(stats?.total_amount || 0)}</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-neutral-600 text-sm mb-1">Pending Applications</p>
              <h3 className="text-3xl font-bold text-warning-500">{stats?.pending_loans || 0}</h3>
            </div>
            <FaChartLine className="text-3xl text-warning-500" />
          </div>
          <p className="text-sm text-neutral-500">Average Amount: {formatCurrency(stats?.average_amount || 0)}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link to="/loan" className="card hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg">
              <FaFileInvoiceDollar className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-800">Loans</h3>
              <p className="text-neutral-600">Apply, track pending, view history</p>
            </div>
          </div>
        </Link>

        <button 
          onClick={() => openPaymentModal('recharge')}
          className="card hover:shadow-xl transition-shadow text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 text-white p-4 rounded-lg">
              <FaMobileAlt className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-800">Mobile Recharge</h3>
              <p className="text-neutral-600">Recharge mobile & DTH instantly</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => openPaymentModal('bills')}
          className="card hover:shadow-xl transition-shadow text-left"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 text-white p-4 rounded-lg">
              <FaBolt className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-800">Pay Bills</h3>
              <p className="text-neutral-600">Electricity, Water, Gas bills</p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Loans */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Recent Loans</h2>
        {recentLoans.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>No loans found yet.</p>
            <Link to="/loan" className="btn-primary mt-4 inline-block">Open Loan Hub</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">ID</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Applied</th>
                  <th className="p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {recentLoans.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-2">{l.id}</td>
                    <td className="p-2">{formatCurrency(l.amount)}</td>
                    <td className="p-2 capitalize">{l.status}</td>
                    <td className="p-2">{new Date(l.application_date).toLocaleDateString()}</td>
                    <td className="p-2"><Link to={`/loan/${l.id}`} className="text-primary-500">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Payments */}
      <div className="card mt-6">
        <h2 className="text-2xl font-bold mb-6">Recent Payments</h2>
        {payments.length === 0 ? (
          <p className="text-neutral-600">No payments recorded.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {payments.slice(0, 5).map((p) => (
              <li key={p.id} className="flex justify-between border rounded p-2">
                <span>{new Date(p.payment_date).toLocaleString()}</span>
                <span>{formatCurrency(p.amount)} ({p.status})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                {selectedService === 'recharge' ? 'Mobile Recharge' : 'Pay Bills'}
              </h2>
              <p className="text-neutral-600">Select your payment app</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => redirectToPaymentApp('phonepe')}
                className="w-full flex items-center justify-between p-4 border-2 border-purple-500 rounded-xl hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <SiPhonepe className="text-4xl text-purple-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-purple-700">PhonePe</p>
                    <p className="text-xs text-neutral-500">Pay with PhonePe</p>
                  </div>
                </div>
                <span className="text-purple-600 text-2xl">→</span>
              </button>

              <button
                onClick={() => redirectToPaymentApp('googlepay')}
                className="w-full flex items-center justify-between p-4 border-2 border-blue-500 rounded-xl hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <SiGooglepay className="text-4xl text-blue-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-blue-700">Google Pay</p>
                    <p className="text-xs text-neutral-500">Pay with Google Pay</p>
                  </div>
                </div>
                <span className="text-blue-600 text-2xl">→</span>
              </button>

              <button
                onClick={() => redirectToPaymentApp('paytm')}
                className="w-full flex items-center justify-between p-4 border-2 border-cyan-500 rounded-xl hover:bg-cyan-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <SiPaytm className="text-4xl text-cyan-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-cyan-700">Paytm</p>
                    <p className="text-xs text-neutral-500">Pay with Paytm</p>
                  </div>
                </div>
                <span className="text-cyan-600 text-2xl">→</span>
              </button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-semibold hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
