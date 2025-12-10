import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingUsd, FaClock, FaHistory, FaRupeeSign } from 'react-icons/fa';
import { getCreditCard } from '../services/creditService';
import { getLoanStatistics } from '../services/loanService';
import { toast } from 'react-toastify';

const formatCurrency = (n) => `₹ ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const StatChip = ({ label, value, color = 'primary' }) => (
  <div className={`rounded-xl p-4 border-2 ${
    color === 'primary' ? 'border-primary-200 bg-primary-50' :
    color === 'success' ? 'border-green-200 bg-green-50' :
    color === 'warning' ? 'border-yellow-200 bg-yellow-50' :
    'border-neutral-200 bg-neutral-50'
  }`}>
    <p className="text-xs text-neutral-600">{label}</p>
    <p className="text-xl font-bold text-neutral-900">{value}</p>
  </div>
);

const LoanHub = () => {
  const navigate = useNavigate();
  const [credit, setCredit] = useState(null);
  const [loanStats, setLoanStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s] = await Promise.all([
          getCreditCard(),
          getLoanStatistics(),
        ]);
        setCredit(c);
        setLoanStats(s.data);
      } catch (e) {
        console.error('Failed to load loan hub data', e);
        toast.error('Failed to load loan data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = Number(credit?.total_limit || 0);
  const used = Number(credit?.used_limit || 0);
  const available = Math.max(0, total - used);
  const usedPct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-800">Loans</h1>
        <p className="text-neutral-600">Apply, track pending requests, and view your loan history</p>
      </div>

      {/* Credit Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-primary-100 text-primary-700">
                <FaRupeeSign className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Credit Summary</h2>
                <p className="text-sm text-neutral-600">Your available and used credit</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <StatChip label="Available Credit" value={formatCurrency(available)} color="success" />
            <StatChip label="Total Limit" value={formatCurrency(total)} color="primary" />
            <StatChip label="Used Credit" value={formatCurrency(used)} color="warning" />
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-sm text-neutral-600 mb-1">
              <span>Usage</span>
              <span>{usedPct}%</span>
            </div>
            <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500" style={{ width: `${usedPct}%` }} />
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Loan Snapshot</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatChip label="Open Loans" value={(loanStats?.approved_loans || 0) + (loanStats?.disbursed_loans || 0)} />
            <StatChip label="Pending" value={loanStats?.pending_loans || 0} color="warning" />
            <StatChip label="Paid Loans" value={loanStats?.repaid_loans || 0} color="success" />
            <StatChip label="Total Amount" value={formatCurrency(loanStats?.total_amount || 0)} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button onClick={() => navigate('/loan/apply')} className="card hover:shadow-lg transition-shadow text-left">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-green-100 text-green-700 rounded-xl">
              <FaHandHoldingUsd className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Apply Loan</h3>
              <p className="text-neutral-600">Instant application with quick approval</p>
            </div>
          </div>
        </button>

        <button onClick={() => navigate('/loan/pending')} className="card hover:shadow-lg transition-shadow text-left">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-yellow-100 text-yellow-700 rounded-xl">
              <FaClock className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Pending Loans</h3>
              <p className="text-neutral-600">Track requests awaiting approval</p>
            </div>
          </div>
        </button>

        <button onClick={() => navigate('/loan/history')} className="card hover:shadow-lg transition-shadow text-left">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-100 text-blue-700 rounded-xl">
              <FaHistory className="text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">History</h3>
              <p className="text-neutral-600">See your past and closed loans</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LoanHub;
