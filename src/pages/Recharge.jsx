import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaMobileAlt, FaSatelliteDish, FaHistory, FaPhone } from 'react-icons/fa';
import { 
  detectOperator, 
  getRechargePlans, 
  processMobileRecharge,
  getDTHOperators,
  getDTHPlans,
  processDTHRecharge,
  getRechargeHistory 
} from '../services/rechargeService';
import { formatCurrency } from '../utils/emiCalculator';

const Recharge = () => {
  const [activeTab, setActiveTab] = useState('mobile'); // 'mobile' or 'dth'
  const [mobile, setMobile] = useState('');
  const [operator, setOperator] = useState(null);
  const [manualOperator, setManualOperator] = useState('');
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('POPULAR');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // DTH state
  const [dthOperators, setDthOperators] = useState([]);
  const [selectedDthOperator, setSelectedDthOperator] = useState('');
  const [dthNumber, setDthNumber] = useState('');
  const [dthPlans, setDthPlans] = useState([]);
  const [selectedDthPlan, setSelectedDthPlan] = useState(null);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // Available mobile operators
  const mobileOperators = [
    { code: 'AIRTEL', name: 'Airtel' },
    { code: 'JIO', name: 'Jio' },
    { code: 'VI', name: 'Vi (Vodafone Idea)' },
    { code: 'BSNL', name: 'BSNL' }
  ];

  // Categories
  const categories = [
    { code: 'POPULAR', name: 'Popular', icon: '🔥' },
    { code: 'RECOMMENDED', name: 'Recommended', icon: '⭐' },
    { code: 'DATA_ADDON', name: 'Data', icon: '📊' },
    { code: 'TALKTIME', name: 'Talktime', icon: '💰' },
    { code: 'LONG_TERM', name: 'Long Term', icon: '📅' },
  ];

  // Load DTH operators on mount
  useEffect(() => {
    if (activeTab === 'dth') {
      loadDTHOperators();
    }
  }, [activeTab]);

  const loadDTHOperators = async () => {
    try {
      const res = await getDTHOperators();
      setDthOperators(res.data || []);
    } catch (error) {
      console.error('Failed to load DTH operators', error);
    }
  };

  // Detect operator when mobile number is entered
  const handleMobileChange = async (value) => {
    setMobile(value);
    setOperator(null);
    setPlans([]);
    setSelectedPlan(null);
    setManualOperator('');

    if (value.length === 10) {
      setLoading(true);
      try {
        const res = await detectOperator(value);
        if (res.data.success) {
          setOperator(res.data);
          setManualOperator(res.data.operator);
          await loadPlans(res.data.operator, res.data.circle);
        }
      } catch (error) {
        toast.error('Failed to detect operator');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle manual operator selection
  const handleManualOperatorChange = async (operatorCode) => {
    setManualOperator(operatorCode);
    if (mobile.length === 10 && operatorCode) {
      await loadPlans(operatorCode, 'Mumbai');
    }
  };

  const loadPlans = async (op, circle) => {
    setLoading(true);
    try {
      const res = await getRechargePlans(op, circle);
      if (res.data.success) {
        setPlans(res.data.plans || []);
      }
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDthOperatorChange = async (operatorCode) => {
    setSelectedDthOperator(operatorCode);
    setDthPlans([]);
    setSelectedDthPlan(null);

    if (operatorCode) {
      setLoading(true);
      try {
        const res = await getDTHPlans(operatorCode);
        if (res.data.success) {
          setDthPlans(res.data.plans || []);
        }
      } catch (error) {
        toast.error('Failed to load DTH plans');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMobileRecharge = async () => {
    if (!selectedPlan) {
      toast.warn('Please select a plan');
      return;
    }

    if (!manualOperator) {
      toast.warn('Please select an operator');
      return;
    }

    setProcessing(true);
    try {
      const res = await processMobileRecharge({
        mobile,
        operator: manualOperator,
        circle: operator?.circle || 'Mumbai',
        planId: selectedPlan.planId,
        amount: selectedPlan.amount,
        planDetails: selectedPlan
      });

      toast.success('Recharge successful! ✅');
      // Reset form
      setMobile('');
      setOperator(null);
      setManualOperator('');
      setPlans([]);
      setSelectedPlan(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Recharge failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDTHRecharge = async () => {
    if (!selectedDthPlan || !dthNumber || !selectedDthOperator) {
      toast.warn('Please fill all fields and select a plan');
      return;
    }

    setProcessing(true);
    try {
      const res = await processDTHRecharge({
        operator: selectedDthOperator,
        accountNumber: dthNumber,
        amount: selectedDthPlan.amount,
        planId: selectedDthPlan.planId,
        planDetails: selectedDthPlan
      });

      toast.success('DTH recharge successful! ✅');
      // Reset form
      setDthNumber('');
      setSelectedDthOperator('');
      setDthPlans([]);
      setSelectedDthPlan(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Recharge failed');
    } finally {
      setProcessing(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await getRechargeHistory(null, 10);
      setHistory(res.data || []);
      setShowHistory(true);
    } catch (error) {
      toast.error('Failed to load history');
    }
  };

  const filteredPlans = plans.filter(p => p.category === selectedCategory);

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Recharge & Bill Payment</h1>
          <p className="text-neutral-600">Quick and easy mobile & DTH recharge</p>
        </div>
        <button 
          onClick={loadHistory}
          className="btn-outline flex items-center space-x-2"
        >
          <FaHistory />
          <span>History</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('mobile')}
          className={`pb-3 px-4 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'mobile' 
              ? 'border-b-2 border-primary-500 text-primary-500' 
              : 'text-neutral-600 hover:text-primary-500'
          }`}
        >
          <FaMobileAlt />
          <span>Mobile Recharge</span>
        </button>
        <button
          onClick={() => setActiveTab('dth')}
          className={`pb-3 px-4 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'dth' 
              ? 'border-b-2 border-primary-500 text-primary-500' 
              : 'text-neutral-600 hover:text-primary-500'
          }`}
        >
          <FaSatelliteDish />
          <span>DTH Recharge</span>
        </button>
      </div>

      {/* Mobile Recharge Tab */}
      {activeTab === 'mobile' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Mobile Input */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaMobileAlt className="mr-2 text-primary-500" />
              Enter Mobile Number
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="input-field text-lg"
              />
            </div>

            {/* Manual Operator Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Operator</label>
              <select
                value={manualOperator}
                onChange={(e) => handleManualOperatorChange(e.target.value)}
                className="input-field"
                disabled={mobile.length < 10}
              >
                <option value="">
                  {mobile.length < 10 ? 'Enter mobile number first' : 'Choose Operator'}
                </option>
                {mobileOperators.map(op => (
                  <option key={op.code} value={op.code}>{op.name}</option>
                ))}
              </select>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner"></div>
                <p className="text-neutral-600 mt-2">Detecting operator...</p>
              </div>
            )}

            {operator && (
              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-4">
                  <img src={operator.operatorLogo} alt={operator.operatorName} className="w-16 h-16 rounded" />
                  <div>
                    <p className="text-sm text-neutral-600">Operator</p>
                    <p className="font-bold text-lg">{operator.operatorName}</p>
                    <p className="text-sm text-neutral-600">{operator.circle}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedPlan && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                <p className="text-sm text-neutral-600 mb-1">Selected Plan</p>
                <p className="font-bold text-2xl text-green-600">{formatCurrency(selectedPlan.amount)}</p>
                <p className="text-sm text-neutral-700 mt-1">{selectedPlan.description}</p>
                <div className="mt-3 space-y-1 text-sm">
                  {selectedPlan.benefits.data && <p>📊 Data: {selectedPlan.benefits.data}</p>}
                  {selectedPlan.benefits.voice && <p>📞 Voice: {selectedPlan.benefits.voice}</p>}
                  {selectedPlan.benefits.sms && <p>💬 SMS: {selectedPlan.benefits.sms}</p>}
                  {selectedPlan.validity && <p>⏱️ Validity: {selectedPlan.validity}</p>}
                </div>
                <button
                  onClick={handleMobileRecharge}
                  disabled={processing}
                  className="btn-primary w-full mt-4"
                >
                  {processing ? 'Processing...' : `Recharge ${formatCurrency(selectedPlan.amount)}`}
                </button>
              </div>
            )}
          </div>

          {/* Right: Plans */}
          <div>
            {plans.length > 0 && (
              <>
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map(cat => (
                    <button
                      key={cat.code}
                      onClick={() => setSelectedCategory(cat.code)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === cat.code
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                {/* Plans Grid */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredPlans.map(plan => (
                    <div
                      key={plan.planId}
                      onClick={() => setSelectedPlan(plan)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedPlan?.planId === plan.planId
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-2xl text-primary-600">{formatCurrency(plan.amount)}</p>
                          {plan.validity && <p className="text-sm text-neutral-600">{plan.validity}</p>}
                        </div>
                        {plan.category === 'RECOMMENDED' && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">⭐ Best</span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-700 font-medium mb-2">{plan.description}</p>
                      <div className="space-y-1 text-xs text-neutral-600">
                        {plan.benefits.data && <p>📊 {plan.benefits.data}</p>}
                        {plan.benefits.voice && <p>📞 {plan.benefits.voice}</p>}
                        {plan.benefits.sms && <p>💬 {plan.benefits.sms}</p>}
                        {plan.talktime > 0 && <p>💰 Talktime: {formatCurrency(plan.talktime)}</p>}
                      </div>
                      {plan.benefits.otherBenefits && plan.benefits.otherBenefits.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-neutral-200">
                          <p className="text-xs text-neutral-500">+ {plan.benefits.otherBenefits.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredPlans.length === 0 && (
                    <p className="text-center text-neutral-500 py-8">No plans in this category</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DTH Recharge Tab */}
      {activeTab === 'dth' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaSatelliteDish className="mr-2 text-primary-500" />
              DTH Recharge
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Operator</label>
              <select
                value={selectedDthOperator}
                onChange={(e) => handleDthOperatorChange(e.target.value)}
                className="input-field"
              >
                <option value="">Choose DTH Operator</option>
                {dthOperators.map(op => (
                  <option key={op.code} value={op.code}>{op.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Customer ID / Card Number</label>
              <input
                type="text"
                value={dthNumber}
                onChange={(e) => setDthNumber(e.target.value)}
                placeholder="Enter customer ID"
                className="input-field"
              />
            </div>

            {selectedDthPlan && (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mt-4">
                <p className="text-sm text-neutral-600 mb-1">Selected Plan</p>
                <p className="font-bold text-2xl text-green-600">{formatCurrency(selectedDthPlan.amount)}</p>
                <p className="text-sm text-neutral-700 mt-1">{selectedDthPlan.planName}</p>
                <p className="text-xs text-neutral-600 mt-2">{selectedDthPlan.description}</p>
                <p className="text-xs text-neutral-600 mt-1">Validity: {selectedDthPlan.validity}</p>
                <button
                  onClick={handleDTHRecharge}
                  disabled={processing}
                  className="btn-primary w-full mt-4"
                >
                  {processing ? 'Processing...' : `Recharge ${formatCurrency(selectedDthPlan.amount)}`}
                </button>
              </div>
            )}
          </div>

          <div>
            {dthPlans.length > 0 && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {dthPlans.map(plan => (
                  <div
                    key={plan.planId}
                    onClick={() => setSelectedDthPlan(plan)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedDthPlan?.planId === plan.planId
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-2xl text-primary-600">{formatCurrency(plan.amount)}</p>
                        <p className="text-sm text-neutral-600">{plan.validity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium mt-2">{plan.planName}</p>
                    <p className="text-xs text-neutral-600 mt-1">{plan.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">📺 {plan.channels} channels</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recharge History</h2>
              <button onClick={() => setShowHistory(false)} className="text-2xl">&times;</button>
            </div>
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{item.operator_name}</p>
                      <p className="text-sm text-neutral-600">
                        {item.mobile_number || item.account_number}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(item.payment_date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(item.amount)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-center text-neutral-500 py-8">No recharge history found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recharge;
