import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaRupeeSign, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getLoans } from '../services/loanService';
import { formatCurrency } from '../utils/emiCalculator';

const PayEMI = () => {
  const navigate = useNavigate();
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveLoans();
  }, []);

  const loadActiveLoans = async () => {
    try {
      // Get all user's loans
      const res = await getLoans();
      const loans = res.data || [];
      
      // Filter for loans that need payment (approved or disbursed status)
      const payableLoans = loans.filter(loan => 
        ['approved', 'disbursed'].includes(loan.status)
      );
      
      setActiveLoans(payableLoans);
    } catch (err) {
      console.error('Failed to load active loans', err);
      toast.error('Failed to load your active loans');
    } finally {
      setLoading(false);
    }
  };

  const calculateLoanProgress = (loan) => {
    const totalAmount = parseFloat(loan.amount);
    const paidAmount = parseFloat(loan.paid_amount || 0);
    const remainingAmount = totalAmount - paidAmount;
    const progressPercent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
    
    return {
      totalAmount,
      paidAmount,
      remainingAmount: Math.max(0, remainingAmount),
      progressPercent: Math.min(100, progressPercent)
    };
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      disbursed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Active' },
    };
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-neutral-600">Loading your loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/loan')} className="flex items-center text-primary-500 mb-4 hover:text-primary-600">
          <FaArrowLeft className="mr-2" /> Back to Loan Hub
        </button>
        <h1 className="text-3xl font-bold text-neutral-800">Pay EMI</h1>
        <p className="text-neutral-600">Select a loan to make a payment</p>
      </div>

      {/* No Active Loans */}
      {activeLoans.length === 0 && (
        <div className="card text-center py-12">
          <div className="mb-4">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No Active Loans</h2>
          <p className="text-neutral-600 mb-6">
            You don't have any loans that require payment at this time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/loan/apply" className="btn-primary">
              Apply for New Loan
            </Link>
            <Link to="/loan/pending" className="btn-outline">
              View Pending Loans
            </Link>
          </div>
        </div>
      )}

      {/* Active Loans List */}
      {activeLoans.length > 0 && (
        <div className="space-y-6">
          {activeLoans.map((loan) => {
            const progress = calculateLoanProgress(loan);
            const nextEMI = parseFloat(loan.emi);
            
            return (
              <div key={loan.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">Loan #{loan.id}</h3>
                      {getStatusBadge(loan.status)}
                    </div>
                    <p className="text-sm text-neutral-600">{loan.purpose}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600">EMI Amount</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatCurrency(nextEMI)}
                    </p>
                  </div>
                </div>

                {/* Loan Details Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Total Loan</p>
                    <p className="text-lg font-semibold">{formatCurrency(progress.totalAmount)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Paid</p>
                    <p className="text-lg font-semibold text-green-700">{formatCurrency(progress.paidAmount)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Remaining</p>
                    <p className="text-lg font-semibold text-orange-700">{formatCurrency(progress.remainingAmount)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-neutral-600 mb-1">Tenure</p>
                    <p className="text-lg font-semibold text-blue-700">{loan.tenure_months} months</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-neutral-600 mb-2">
                    <span>Payment Progress</span>
                    <span className="font-semibold">{progress.progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Loan Info */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-neutral-600">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span>Applied: {new Date(loan.application_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <FaRupeeSign className="mr-2" />
                    <span>Interest: {loan.interest_rate}%</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/loan/${loan.id}/pay`)}
                    className="btn-primary flex-1"
                  >
                    <FaRupeeSign className="inline mr-2" />
                    Pay EMI ({formatCurrency(nextEMI)})
                  </button>
                  <Link
                    to={`/loan/${loan.id}`}
                    className="btn-outline flex-1 text-center"
                  >
                    View Details
                  </Link>
                </div>

                {/* Quick Info Alert */}
                {loan.status === 'approved' && progress.paidAmount === 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>First Payment:</strong> Make your first EMI payment to activate this loan.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Help Section */}
      {activeLoans.length > 0 && (
        <div className="card mt-6 bg-neutral-50 border-2 border-neutral-200">
          <h3 className="font-semibold mb-3">💡 Payment Options</h3>
          <ul className="text-sm text-neutral-700 space-y-2">
            <li>• <strong>Pay EMI:</strong> Make your regular monthly installment payment</li>
            <li>• <strong>Prepayment:</strong> Pay extra amount to reduce loan tenure</li>
            <li>• <strong>Full Closing:</strong> Pay remaining balance and close the loan</li>
          </ul>
          <p className="text-xs text-neutral-500 mt-3">
            All payments are processed securely via UPI. You'll be redirected to your UPI app to complete the transaction.
          </p>
        </div>
      )}
    </div>
  );
};

export default PayEMI;
