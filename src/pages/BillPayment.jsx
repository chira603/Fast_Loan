import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaBolt, FaTint, FaFire } from 'react-icons/fa';
import { formatCurrency } from '../utils/emiCalculator';

const BillPayment = () => {
  const [category, setCategory] = useState('ELECTRICITY');
  const [accountNumber, setAccountNumber] = useState('');
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const categories = [
    { code: 'ELECTRICITY', name: 'Electricity', icon: <FaBolt className="text-yellow-500" /> },
    { code: 'WATER', name: 'Water', icon: <FaTint className="text-blue-500" /> },
    { code: 'GAS', name: 'Gas', icon: <FaFire className="text-orange-500" /> },
  ];

  const operators = {
    ELECTRICITY: [
      { id: 'ELEC001', name: 'Adani Electricity Mumbai' },
      { id: 'ELEC002', name: 'TATA Power Delhi' },
      { id: 'ELEC003', name: 'BEST Mumbai' },
    ],
    WATER: [
      { id: 'WATER001', name: 'Mumbai Municipal Corporation' },
      { id: 'WATER002', name: 'Delhi Jal Board' },
    ],
    GAS: [
      { id: 'GAS001', name: 'Mahanagar Gas Limited' },
      { id: 'GAS002', name: 'Indraprastha Gas Limited' },
    ]
  };

  const [selectedOperator, setSelectedOperator] = useState('');

  const handleFetchBill = async () => {
    if (!selectedOperator || !accountNumber) {
      toast.warn('Please select operator and enter account number');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const amount = (Math.random() * 3000 + 500).toFixed(2);
      setBillDetails({
        accountNumber,
        operatorName: operators[category].find(o => o.id === selectedOperator)?.name,
        customerName: 'John Doe',
        billAmount: parseFloat(amount),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        billNumber: `BILL${Date.now()}`,
      });
      setLoading(false);
      toast.success('Bill fetched successfully');
    }, 1000);
  };

  const handlePayBill = async () => {
    setProcessing(true);
    setTimeout(() => {
      toast.success('Bill payment successful! ✅');
      setBillDetails(null);
      setAccountNumber('');
      setSelectedOperator('');
      setProcessing(false);
    }, 1500);
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Bill Payment</h1>

      {/* Category Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        {categories.map(cat => (
          <button
            key={cat.code}
            onClick={() => {
              setCategory(cat.code);
              setBillDetails(null);
              setSelectedOperator('');
            }}
            className={`pb-3 px-4 font-semibold transition-colors flex items-center space-x-2 ${
              category === cat.code
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-neutral-600 hover:text-primary-500'
            }`}
          >
            {cat.icon}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Bill Input */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Enter Bill Details</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Provider</label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="input-field"
            >
              <option value="">Choose Provider</option>
              {operators[category].map(op => (
                <option key={op.id} value={op.id}>{op.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Account Number / Consumer Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
              className="input-field"
            />
          </div>

          <button
            onClick={handleFetchBill}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Fetching...' : 'Fetch Bill'}
          </button>
        </div>

        {/* Right: Bill Details */}
        <div>
          {billDetails && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Bill Details</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Customer Name:</span>
                  <span className="font-semibold">{billDetails.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Account Number:</span>
                  <span className="font-semibold">{billDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bill Number:</span>
                  <span className="font-semibold">{billDetails.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Due Date:</span>
                  <span className="font-semibold text-red-600">{billDetails.dueDate}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-neutral-200">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-3xl font-bold text-primary-600">
                    {formatCurrency(billDetails.billAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayBill}
                disabled={processing}
                className="btn-primary w-full text-lg py-3"
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(billDetails.billAmount)}`}
              </button>
            </div>
          )}

          {!billDetails && (
            <div className="card text-center py-12">
              <p className="text-neutral-500">Enter details and fetch bill to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillPayment;
