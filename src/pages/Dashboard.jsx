import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaPlus, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa';
import { getLoanStatistics, getLoans } from '../services/loanService';
import { getPaymentsByUser } from '../services/paymentService';
import { formatCurrency } from '../utils/emiCalculator';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [payments, setPayments] = useState([]);

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
      <div className="grid md:grid-cols-1 gap-6 mb-8">
        <Link to="/loan/apply" className="card hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-500 text-white p-4 rounded-lg">
              <FaPlus className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-800">Apply for New Loan</h3>
              <p className="text-neutral-600">Get instant approval up to $5,000</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Loans */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Recent Loans</h2>
        {recentLoans.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>No loans found. Apply for your first loan today!</p>
            <Link to="/loan/apply" className="btn-primary mt-4 inline-block">Apply Now</Link>
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
    </div>
  );
};

export default Dashboard;
