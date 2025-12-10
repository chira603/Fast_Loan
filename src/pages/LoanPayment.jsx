import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft } from 'react-icons/fa';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';
import { toast } from 'react-toastify';
import { initiateLoanPayment, verifyLoanPayment, openUPIApp } from '../services/loanPaymentService';
import { getLoanById } from '../services/loanService';
import { formatCurrency } from '../utils/emiCalculator';

const LoanPayment = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState('init'); // init, payment, verify, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState('emi');
  const [customAmount, setCustomAmount] = useState('');
  const [upiTxnId, setUpiTxnId] = useState('');

  useEffect(() => {
    loadLoan();
  }, [loanId]);

  const loadLoan = async () => {
    try {
      const res = await getLoanById(loanId);
      setLoan(res.data);
    } catch (err) {
      toast.error('Failed to load loan details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculatePaymentAmount = () => {
    if (!loan) return 0;
    
    switch (selectedPaymentType) {
      case 'emi':
        return parseFloat(loan.emi);
      case 'closing':
        return parseFloat(loan.amount) - parseFloat(loan.paid_amount || 0);
      case 'prepayment':
        return parseFloat(customAmount || 0);
      default:
        return 0;
    }
  };

  const handleInitiatePayment = async () => {
    const amount = calculatePaymentAmount();
    
    if (amount <= 0) {
      toast.error('Invalid payment amount');
      return;
    }

    try {
      setLoading(true);
      const res = await initiateLoanPayment({
        loan_id: parseInt(loanId),
        amount,
        payment_type: selectedPaymentType,
        notes: `${selectedPaymentType.toUpperCase()} payment for Loan #${loanId}`
      });

      setPaymentData(res.data);
      setPaymentStep('payment');
      toast.success('Payment initiated! Choose your UPI app');
    } catch (err) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleUPIAppClick = (appId) => {
    if (!paymentData) return;

    // Open UPI app
    openUPIApp(paymentData.upi_link);
    
    // Move to verification step
    setTimeout(() => {
      setPaymentStep('verify');
    }, 1000);
  };

  const handleVerifyPayment = async (status) => {
    if (!paymentData) return;

    try {
      setLoading(true);
      await verifyLoanPayment({
        transaction_ref: paymentData.transaction_ref,
        upi_txn_id: upiTxnId,
        status
      });

      if (status === 'success') {
        setPaymentStep('success');
        toast.success('Payment verified successfully!');
        setTimeout(() => navigate(`/loan/${loanId}`), 3000);
      } else {
        setPaymentStep('failed');
        toast.error('Payment marked as failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !loan) {
    return (
      <div className="container-custom py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!loan) {
    return null;
  }

  const remainingAmount = parseFloat(loan.amount) - parseFloat(loan.paid_amount || 0);

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(`/loan/${loanId}`)} className="flex items-center text-primary-500 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Loan Details
        </button>
        <h1 className="text-3xl font-bold text-neutral-800">Loan Payment</h1>
        <p className="text-neutral-600">Loan #{loanId} - Remaining: {formatCurrency(remainingAmount)}</p>
      </div>

      {/* Payment Steps */}
      {paymentStep === 'init' && (
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Select Payment Type</h2>

          <div className="space-y-4 mb-6">
            {/* EMI Payment */}
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedPaymentType === 'emi' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
            }`}>
              <input
                type="radio"
                name="paymentType"
                value="emi"
                checked={selectedPaymentType === 'emi'}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                className="mr-4"
              />
              <div className="flex-1">
                <p className="font-semibold">Pay EMI</p>
                <p className="text-sm text-neutral-600">Monthly installment payment</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary-500">{formatCurrency(loan.emi)}</p>
              </div>
            </label>

            {/* Full Closing */}
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedPaymentType === 'closing' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
            }`}>
              <input
                type="radio"
                name="paymentType"
                value="closing"
                checked={selectedPaymentType === 'closing'}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                className="mr-4"
              />
              <div className="flex-1">
                <p className="font-semibold">Full Closing</p>
                <p className="text-sm text-neutral-600">Pay remaining amount and close loan</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-500">{formatCurrency(remainingAmount)}</p>
              </div>
            </label>

            {/* Prepayment */}
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedPaymentType === 'prepayment' ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
            }`}>
              <input
                type="radio"
                name="paymentType"
                value="prepayment"
                checked={selectedPaymentType === 'prepayment'}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                className="mr-4"
              />
              <div className="flex-1">
                <p className="font-semibold">Prepayment</p>
                <p className="text-sm text-neutral-600">Pay custom amount</p>
                {selectedPaymentType === 'prepayment' && (
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    min="1"
                    max={remainingAmount}
                  />
                )}
              </div>
            </label>
          </div>

          <button
            onClick={handleInitiatePayment}
            disabled={loading || (selectedPaymentType === 'prepayment' && !customAmount)}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : `Pay ${formatCurrency(calculatePaymentAmount())}`}
          </button>
        </div>
      )}

      {/* UPI App Selection */}
      {paymentStep === 'payment' && paymentData && (
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-2">Choose Payment App</h2>
          <p className="text-neutral-600 mb-6">
            Amount: <span className="font-bold text-primary-500">{paymentData.amount}</span>
          </p>

          <div className="space-y-4">
            {paymentData.supported_apps?.map((app) => (
              <button
                key={app.id}
                onClick={() => handleUPIAppClick(app.id)}
                className="w-full flex items-center justify-between p-4 border-2 rounded-xl hover:bg-neutral-50 transition-all group"
                style={{ borderColor: app.color }}
              >
                <div className="flex items-center space-x-4">
                  {app.id === 'phonepe' && <SiPhonepe className="text-4xl group-hover:scale-110 transition-transform" style={{ color: app.color }} />}
                  {app.id === 'googlepay' && <SiGooglepay className="text-4xl group-hover:scale-110 transition-transform" style={{ color: app.color }} />}
                  {app.id === 'paytm' && <SiPaytm className="text-4xl group-hover:scale-110 transition-transform" style={{ color: app.color }} />}
                  <div className="text-left">
                    <p className="font-bold text-lg">{app.name}</p>
                    <p className="text-xs text-neutral-500">Pay with {app.name}</p>
                  </div>
                </div>
                <span className="text-2xl" style={{ color: app.color }}>→</span>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-600">
              <strong>Payment To:</strong> {paymentData.business_name}
            </p>
            <p className="text-sm text-neutral-600">
              <strong>UPI ID:</strong> {paymentData.business_vpa}
            </p>
            <p className="text-sm text-neutral-600">
              <strong>Reference:</strong> {paymentData.transaction_ref}
            </p>
          </div>
        </div>
      )}

      {/* Verification Step */}
      {paymentStep === 'verify' && paymentData && (
        <div className="card max-w-2xl mx-auto text-center">
          <FaClock className="text-6xl text-warning-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Verify Payment</h2>
          <p className="text-neutral-600 mb-6">
            Did you complete the payment in your UPI app?
          </p>

          <div className="mb-6">
            <label className="block text-left text-sm font-medium text-neutral-700 mb-2">
              UPI Transaction ID (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter UPI Transaction ID"
              value={upiTxnId}
              onChange={(e) => setUpiTxnId(e.target.value)}
              className="input-field w-full"
            />
            <p className="text-xs text-neutral-500 mt-1">
              You can find this in your UPI app's transaction history
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleVerifyPayment('success')}
              disabled={loading}
              className="btn-primary flex-1"
            >
              <FaCheckCircle className="inline mr-2" />
              Yes, Payment Successful
            </button>
            <button
              onClick={() => handleVerifyPayment('failed')}
              disabled={loading}
              className="btn-outline flex-1 border-red-500 text-red-500 hover:bg-red-50"
            >
              <FaTimesCircle className="inline mr-2" />
              Payment Failed
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {paymentStep === 'success' && (
        <div className="card max-w-2xl mx-auto text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Payment Successful!</h2>
          <p className="text-neutral-600 mb-6">
            Your payment has been recorded. Redirecting to loan details...
          </p>
        </div>
      )}

      {/* Failed */}
      {paymentStep === 'failed' && (
        <div className="card max-w-2xl mx-auto text-center">
          <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Payment Failed</h2>
          <p className="text-neutral-600 mb-6">
            The payment was not completed. You can try again.
          </p>
          <button onClick={() => setPaymentStep('init')} className="btn-primary">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default LoanPayment;
