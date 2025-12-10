import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaRupeeSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getLoanById } from '../services/loanService';
import { getPaymentsByLoan, makePayment } from '../services/paymentService';
import { formatCurrency } from '../utils/emiCalculator';
import { createRazorpayOrder, openRazorpayCheckout, verifyRazorpayPayment } from '../services/razorpay';

const LoanDetails = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const l = await getLoanById(id);
        setLoan(l.data);
        setPaymentAmount(l.data.emi || ''); // Default to EMI amount
        const p = await getPaymentsByLoan(id);
        setPayments(p.data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load loan');
      }
    };
    load();
  }, [id]);

  const handleMakePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.warn('Please enter a valid payment amount');
      return;
    }
    setProcessing(true);
    try {
      await makePayment({
        loan_id: id,
        amount: parseFloat(paymentAmount),
        payment_method: 'wallet',
      });
      toast.success('Payment successful! ✅');
      
      // Reload loan and payments
      const l = await getLoanById(id);
      setLoan(l.data);
      const p = await getPaymentsByLoan(id);
      setPayments(p.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const payWithRazorpay = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.warn('Please enter a valid payment amount');
      return;
    }
    setProcessing(true);
    try {
      const purpose = `EMI Payment - Loan #${id}`;
      const orderRes = await createRazorpayOrder(paymentAmount, purpose, { loan_id: id });
      const { keyId, orderId, amount: amountInPaise } = orderRes;

      const checkoutRes = await openRazorpayCheckout({
        keyId,
        orderId,
        amount: amountInPaise,
        currency: 'INR',
        name: 'FAST LOAN',
        description: purpose,
        notes: { loan_id: id },
      });

      await verifyRazorpayPayment({
        razorpay_order_id: checkoutRes.razorpay_order_id,
        razorpay_payment_id: checkoutRes.razorpay_payment_id,
        razorpay_signature: checkoutRes.razorpay_signature,
        amount: parseFloat(paymentAmount),
      });

      toast.success('Payment successful! Processing EMI...');
      await handleMakePayment();
    } catch (err) {
      toast.error(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (!loan) {
    return (
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-6">Loan Details</h1>
        <div className="card"><p>Loading…</p></div>
      </div>
    );
  }

  const statusColor = {
    pending: 'text-yellow-600',
    approved: 'text-green-600',
    rejected: 'text-red-600',
    disbursed: 'text-blue-600',
    repaid: 'text-green-600',
  }[loan.status] || 'text-neutral-700';

  // Calculate payment statistics
  const totalPaid = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  const totalLoanAmount = loan.amount * (1 + (loan.interest_rate * loan.tenure_months) / 1200);
  const remainingBalance = Math.max(0, totalLoanAmount - totalPaid);
  
  // Find next pending EMI
  const nextEMI = loan.repayment_schedule?.find(emi => emi.status === 'pending');
  
  // Count paid EMIs
  const paidEMIs = loan.repayment_schedule?.filter(emi => emi.status === 'paid').length || 0;

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-2">Loan #{loan.id}</h1>
      <p className={`mb-6 font-medium ${statusColor}`}>Status: {loan.status.toUpperCase()}</p>

      {/* Payment Progress Summary */}
      {(loan.status === 'approved' || loan.status === 'disbursed' || loan.status === 'repaid') && (
        <div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="font-bold text-lg mb-4 text-blue-900">Payment Progress</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Loan Amount</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalLoanAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining Balance</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(remainingBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">EMIs Paid</p>
              <p className="text-xl font-bold text-blue-600">{paidEMIs} / {loan.tenure_months}</p>
            </div>
          </div>
          
          {nextEMI && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-medium text-yellow-900">
                📅 Next EMI: {formatCurrency(nextEMI.amount)} due on {nextEMI.due_date}
              </p>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Repayment Progress</span>
              <span className="font-medium">{Math.round((totalPaid / totalLoanAmount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalPaid / totalLoanAmount) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-2">Loan Summary</h3>
          <ul className="text-sm space-y-1">
            <li>Principal: {formatCurrency(loan.amount)}</li>
            <li>Tenure: {loan.tenure_months} months</li>
            <li>Interest: {loan.interest_rate}%</li>
            <li>EMI: {formatCurrency(loan.emi)}</li>
            <li>Applied on: {new Date(loan.application_date).toLocaleString()}</li>
            {loan.approval_date && <li>Approved on: {new Date(loan.approval_date).toLocaleString()}</li>}
            <li>Purpose: {loan.purpose}</li>
          </ul>
        </div>

        <div className="card md:col-span-2">
          <h3 className="font-semibold mb-2">Repayment Schedule</h3>
          {Array.isArray(loan.repayment_schedule) ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Month</th>
                    <th className="p-2">Due Date</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Principal</th>
                    <th className="p-2">Interest</th>
                    <th className="p-2">Balance</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loan.repayment_schedule.map((row, idx) => {
                    const isPaid = row.status === 'paid';
                    const isPartial = row.status === 'partial';
                    const isPending = row.status === 'pending';
                    
                    return (
                      <tr 
                        key={idx} 
                        className={`border-t ${isPaid ? 'bg-green-50' : isPartial ? 'bg-yellow-50' : ''}`}
                      >
                        <td className="p-2 font-medium">{row.month}</td>
                        <td className="p-2">{row.due_date}</td>
                        <td className="p-2 font-semibold">{formatCurrency(row.amount)}</td>
                        <td className="p-2">{formatCurrency(row.principal)}</td>
                        <td className="p-2">{formatCurrency(row.interest)}</td>
                        <td className="p-2">{formatCurrency(row.balance)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isPaid ? 'bg-green-100 text-green-800' :
                            isPartial ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {isPaid ? '✓ Paid' : isPartial ? '⚠ Partial' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-neutral-600">No schedule available.</p>
          )}
        </div>
      </div>

      {/* Payment Section - only show for approved/disbursed loans */}
      {(loan.status === 'approved' || loan.status === 'disbursed') && remainingBalance > 0 && (
        <div className="card mt-6 border-2 border-primary-200 bg-primary-50">
          <h3 className="font-bold text-lg mb-4 text-primary-900">💳 Make Payment via UPI</h3>
          <p className="text-neutral-700 mb-4">
            Choose your payment type and complete the payment securely through UPI.
          </p>
          <div className="flex gap-4">
            <Link 
              to={`/loan/${id}/pay`}
              className="btn-primary inline-flex items-center"
            >
              <FaRupeeSign className="mr-2" />
              Pay Now
            </Link>
            <div className="text-sm text-neutral-600 self-center">
              <p><strong>EMI Amount:</strong> {formatCurrency(loan.emi)}</p>
              <p><strong>Remaining:</strong> {formatCurrency(remainingBalance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Payment Section (backup) */}
      {false && (loan.status === 'approved' || loan.status === 'disbursed') && remainingBalance > 0 && (
        <div className="card mt-6 border-2 border-blue-200 bg-blue-50">
          <h3 className="font-bold text-lg mb-4 text-blue-900">💳 Make EMI Payment (Wallet)</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700">Payment Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-field text-lg font-semibold"
                  min="0"
                  step="1"
                />
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    💰 Monthly EMI: <span className="font-semibold">{formatCurrency(loan.emi)}</span>
                  </p>
                  <p className="text-sm text-orange-600">
                    📊 Remaining Balance: <span className="font-bold">{formatCurrency(remainingBalance)}</span>
                  </p>
                  {nextEMI && (
                    <p className="text-sm text-blue-600">
                      📅 Next Due: <span className="font-semibold">{nextEMI.due_date}</span>
                    </p>
                  )}
                </div>
              </div>
              
              {/* Quick amount buttons */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Quick Select:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentAmount(loan.emi)}
                    className="btn-outline text-xs px-3 py-1"
                  >
                    1 EMI
                  </button>
                  <button
                    onClick={() => setPaymentAmount(loan.emi * 3)}
                    className="btn-outline text-xs px-3 py-1"
                  >
                    3 EMIs
                  </button>
                  <button
                    onClick={() => setPaymentAmount(Math.min(remainingBalance, loan.emi * 6))}
                    className="btn-outline text-xs px-3 py-1"
                  >
                    6 EMIs
                  </button>
                  <button
                    onClick={() => setPaymentAmount(remainingBalance)}
                    className="btn-outline text-xs px-3 py-1"
                  >
                    Full Payment
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleMakePayment}
                  disabled={processing}
                  className="btn-outline w-full"
                >
                  {processing ? 'Processing...' : 'Pay via Wallet'}
                </button>
                <button
                  onClick={payWithRazorpay}
                  disabled={processing}
                  className="btn-primary w-full"
                >
                  {processing ? 'Processing...' : 'Pay with Razorpay'}
                </button>
              </div>
            </div>
            
            {/* Payment Info Panel */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold mb-3 text-gray-800">Payment Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total EMIs:</span>
                  <span className="font-medium">{loan.tenure_months}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid EMIs:</span>
                  <span className="font-medium text-green-600">{paidEMIs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending EMIs:</span>
                  <span className="font-medium text-orange-600">{loan.tenure_months - paidEMIs}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Loan + Interest:</span>
                    <span>{formatCurrency(totalLoanAmount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-gray-600">
                <p className="font-medium mb-1">💡 Payment Methods:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Wallet: Instant payment from your account balance</li>
                  <li>Razorpay: Pay with Card, UPI, or Netbanking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-6">
        <h3 className="font-semibold mb-2">Payments</h3>
        {payments.length === 0 ? (
          <p className="text-neutral-600">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Method</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{new Date(p.payment_date).toLocaleString()}</td>
                    <td className="p-2">{formatCurrency(p.amount)}</td>
                    <td className="p-2">{p.payment_method}</td>
                    <td className="p-2 capitalize">{p.status}</td>
                    <td className="p-2">{p.transaction_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanDetails;
