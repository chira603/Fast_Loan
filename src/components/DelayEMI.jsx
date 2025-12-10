import { useState, useEffect } from 'react';
import { FaClock, FaCrown, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { requestEMIDelay, calculateDelayCharges } from '../services/delayService';
import { checkFlexStatus } from '../services/flexService';
import { useNavigate } from 'react-router-dom';

const DelayEMI = ({ loan, emiMonth, onSuccess }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [delayDays, setDelayDays] = useState(1);
  const [charges, setCharges] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasFlexPlus, setHasFlexPlus] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadFlexStatus();
  }, []);

  useEffect(() => {
    if (showModal) {
      loadCharges();
    }
  }, [delayDays, showModal, hasFlexPlus]);

  const loadFlexStatus = async () => {
    try {
      const response = await checkFlexStatus();
      setHasFlexPlus(response.has_flex_plus);
    } catch (error) {
      console.error('Error checking Flex+ status:', error);
    }
  };

  const loadCharges = async () => {
    try {
      const emi = loan.repayment_schedule?.find(s => s.month === emiMonth);
      if (!emi) return;

      const chargesData = await calculateDelayCharges(
        parseFloat(emi.amount),
        delayDays,
        hasFlexPlus
      );
      setCharges(chargesData);
    } catch (error) {
      console.error('Error calculating charges:', error);
    }
  };

  const handleDelayRequest = async () => {
    try {
      setLoading(true);

      const response = await requestEMIDelay({
        loan_id: loan.id,
        emi_month: emiMonth,
        delay_days: delayDays,
        reason: reason || 'User requested delay'
      });

      toast.success(response.message);
      setShowModal(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request delay');
    } finally {
      setLoading(false);
    }
  };

  const emi = loan.repayment_schedule?.find(s => s.month === emiMonth);
  if (!emi || emi.status === 'paid') return null;

  const canDelay = (emi.delay_count || 0) < 3;

  return (
    <>
      <button
        onClick={() => {
          if (!canDelay) {
            toast.error('Maximum delays (3) reached for this EMI');
            return;
          }
          setShowModal(true);
        }}
        disabled={!canDelay}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
          canDelay
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
        }`}
        title={canDelay ? 'Delay this EMI by 1-2 days' : 'Maximum delays reached'}
      >
        <FaClock />
        <span>Delay EMI</span>
      </button>

      {/* Delay Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Delay EMI Payment</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            {/* Flex+ Banner */}
            {!hasFlexPlus && (
              <div className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-start">
                  <FaCrown className="text-yellow-500 text-xl mr-2 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-neutral-800 mb-1">
                      Get FREE delays with Flex+! 
                    </p>
                    <p className="text-xs text-neutral-600 mb-2">
                      Subscribe for just ₹99/month and never pay delay fees again!
                    </p>
                    <button
                      onClick={() => navigate('/flex-plus')}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Learn More →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {hasFlexPlus && (
              <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4">
                <div className="flex items-center">
                  <FaCrown className="text-yellow-500 text-xl mr-2" />
                  <p className="font-semibold text-sm text-green-800">
                    🎉 Free delay with your Flex+ membership!
                  </p>
                </div>
              </div>
            )}

            {/* EMI Details */}
            <div className="mb-4 bg-neutral-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-600">EMI Amount:</span>
                <span className="font-semibold">₹{emi.amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-600">Original Due Date:</span>
                <span className="font-semibold">
                  {new Date(emi.due_date).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Delays Used:</span>
                <span className="font-semibold">{emi.delay_count || 0} / 3</span>
              </div>
            </div>

            {/* Delay Days Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Delay by how many days? (Maximum 2 days)
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDelayDays(1)}
                  className={`flex-1 py-3 rounded-lg font-semibold ${
                    delayDays === 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  1 Day
                </button>
                <button
                  onClick={() => setDelayDays(2)}
                  className={`flex-1 py-3 rounded-lg font-semibold ${
                    delayDays === 2
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  2 Days
                </button>
              </div>
            </div>

            {/* New Due Date */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-neutral-600 mb-1">New Due Date:</p>
              <p className="font-bold text-lg">
                {new Date(
                  new Date(emi.due_date).getTime() + delayDays * 24 * 60 * 60 * 1000
                ).toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* Charges Breakdown */}
            {charges && (
              <div className="mb-4 border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Charges Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Delay Fee:</span>
                    <span className={hasFlexPlus ? 'line-through text-neutral-400' : 'font-semibold'}>
                      ₹{charges.delay_fee?.toFixed(2) || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Extra Interest:</span>
                    <span className={hasFlexPlus ? 'line-through text-neutral-400' : 'font-semibold'}>
                      ₹{charges.extra_interest?.toFixed(2) || 0}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Charge:</span>
                    <span className={hasFlexPlus ? 'text-green-600' : 'text-primary-600'}>
                      {hasFlexPlus ? 'FREE' : `₹${charges.total_charge?.toFixed(2) || 0}`}
                    </span>
                  </div>
                  {hasFlexPlus && (
                    <p className="text-xs text-green-600 flex items-center mt-2">
                      <FaInfoCircle className="mr-1" />
                      You save ₹{((charges.delay_fee || 0) + (charges.extra_interest || 0)).toFixed(2)} with Flex+!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Reason (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Salary delayed, emergency expense..."
                className="w-full px-3 py-2 border rounded-lg resize-none"
                rows="2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelayRequest}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Delay'}
              </button>
            </div>

            {/* Info Note */}
            <p className="text-xs text-neutral-500 mt-4 flex items-start">
              <FaInfoCircle className="mr-1 mt-0.5 flex-shrink-0" />
              <span>
                Delays follow a 28-day EMI cycle. Maximum 3 delays allowed per EMI.
                {!hasFlexPlus && ' Subscribe to Flex+ for unlimited free delays!'}
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DelayEMI;
