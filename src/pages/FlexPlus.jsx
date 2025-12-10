import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaCheck, FaBolt, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getFlexPricing, subscribeToFlex, getMySubscription } from '../services/flexService';

const FlexPlus = () => {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pricingData, subData] = await Promise.all([
        getFlexPricing(),
        getMySubscription()
      ]);
      
      setPricing(pricingData.data);
      setHasSubscription(subData.has_subscription);
      setActiveSubscription(subData.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setSelectedPlan(plan.id);
      
      // In production, integrate with payment gateway
      const subscriptionData = {
        duration_months: plan.duration_months,
        payment_method: 'UPI',
        transaction_id: `FLEX-${Date.now()}`,
        auto_renewal: false
      };

      const response = await subscribeToFlex(subscriptionData);
      
      toast.success(response.message);
      loadData(); // Refresh data
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed');
    } finally {
      setSelectedPlan(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <FaCrown className="text-6xl text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Flex<span className="text-primary-600">+</span> Membership
        </h1>
        <p className="text-xl text-neutral-600">
          Get FREE EMI delays & premium benefits
        </p>
      </div>

      {/* Active Subscription Banner */}
      {hasSubscription && activeSubscription && (
        <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <FaCrown className="text-3xl text-yellow-500 mr-4" />
              <div>
                <h3 className="text-xl font-bold text-neutral-800 mb-1">
                  🎉 You're a Flex+ Member!
                </h3>
                <p className="text-neutral-600">
                  Expires on {formatDate(activeSubscription.end_date)} 
                  <span className="ml-2 text-sm font-semibold text-orange-600">
                    ({calculateDaysRemaining(activeSubscription.end_date)} days left)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="mb-12 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Flex+?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <FaCheck className="text-green-500 text-xl mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">FREE EMI Delays</h3>
              <p className="text-neutral-600">Delay your EMI by 1-2 days absolutely free. No delay fees, no extra interest!</p>
            </div>
          </div>

          <div className="flex items-start">
            <FaCheck className="text-green-500 text-xl mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Save ₹10-30 per Delay</h3>
              <p className="text-neutral-600">Regular users pay ₹10-30 as delay fee. You pay ZERO!</p>
            </div>
          </div>

          <div className="flex items-start">
            <FaCheck className="text-green-500 text-xl mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Emotional Relief</h3>
              <p className="text-neutral-600">Life happens! Get flexibility when you need it without penalty.</p>
            </div>
          </div>

          <div className="flex items-start">
            <FaCheck className="text-green-500 text-xl mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Priority Support</h3>
              <p className="text-neutral-600">Get faster response times and dedicated support.</p>
            </div>
          </div>
        </div>

        {/* Savings Calculator */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-2 text-green-800">💰 Savings Example</h3>
          <p className="text-neutral-700">
            If you delay EMI <strong>4 times in a month</strong>:
          </p>
          <div className="mt-3 space-y-1">
            <p className="text-neutral-600">Regular User: ₹20 × 4 = <span className="line-through">₹80</span></p>
            <p className="text-green-700 font-bold text-xl">Flex+ Member: ₹0 (You save ₹80!)</p>
          </div>
          <p className="mt-3 text-sm text-neutral-600">
            The membership pays for itself in just 3-5 delays! 🎯
          </p>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Plan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map((plan) => {
            const features = typeof plan.features === 'string' 
              ? JSON.parse(plan.features) 
              : plan.features;
            
            const isPopular = plan.duration_months === 3;
            const savings = features.savings || 0;

            return (
              <div
                key={plan.id}
                className={`rounded-lg border-2 p-6 relative ${
                  isPopular
                    ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-white'
                    : 'border-neutral-300 bg-white'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.plan_name}</h3>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold text-primary-600">₹{plan.price}</span>
                  </div>
                  <p className="text-neutral-600">
                    ₹{Math.round(plan.price / plan.duration_months)}/month
                  </p>
                  {savings > 0 && (
                    <p className="text-sm text-green-600 font-semibold mt-2">
                      Save ₹{savings}!
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <FaBolt className="text-yellow-500 mr-2" />
                    <span>Unlimited FREE EMI delays</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaBolt className="text-yellow-500 mr-2" />
                    <span>No delay fees (Save ₹10-30)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaBolt className="text-yellow-500 mr-2" />
                    <span>No extra interest charges</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaBolt className="text-yellow-500 mr-2" />
                    <span>Priority customer support</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaBolt className="text-yellow-500 mr-2" />
                    <span>Valid for {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={hasSubscription || selectedPlan === plan.id}
                  className={`btn w-full ${
                    isPopular
                      ? 'btn-primary'
                      : 'bg-neutral-700 hover:bg-neutral-800 text-white'
                  } ${hasSubscription || selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </span>
                  ) : hasSubscription ? (
                    'Already Subscribed'
                  ) : (
                    `Subscribe Now`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-neutral-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Subscribe to Flex+</h3>
            <p className="text-sm text-neutral-600">
              Choose your plan and activate membership in seconds
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Delay EMI Anytime</h3>
            <p className="text-sm text-neutral-600">
              Use the "Delay EMI" button to extend by 1-2 days FREE
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Save Money</h3>
            <p className="text-sm text-neutral-600">
              No delay fees, no extra interest. Complete flexibility!
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">FAQs</h2>
        <div className="space-y-4">
          <details className="bg-white rounded-lg p-4 shadow-sm">
            <summary className="font-semibold cursor-pointer">Can I delay any EMI?</summary>
            <p className="mt-2 text-neutral-600">Yes! You can delay any EMI by 1-2 days, completely free with Flex+ membership.</p>
          </details>

          <details className="bg-white rounded-lg p-4 shadow-sm">
            <summary className="font-semibold cursor-pointer">How many times can I delay?</summary>
            <p className="mt-2 text-neutral-600">Unlimited! As long as your Flex+ subscription is active, use it as many times as needed.</p>
          </details>

          <details className="bg-white rounded-lg p-4 shadow-sm">
            <summary className="font-semibold cursor-pointer">What happens after subscription expires?</summary>
            <p className="mt-2 text-neutral-600">You'll return to regular user status. Delays will cost ₹10-30 per use. You can renew anytime!</p>
          </details>

          <details className="bg-white rounded-lg p-4 shadow-sm">
            <summary className="font-semibold cursor-pointer">Is there a limit on delay days?</summary>
            <p className="mt-2 text-neutral-600">Yes, you can delay by 1 or 2 days only per request, following 28-day EMI cycle rules.</p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default FlexPlus;
