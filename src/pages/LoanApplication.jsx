import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createLoan } from '../services/loanService';
import { calculateEMI, generateRepaymentSchedule, checkAffordability, formatCurrency } from '../utils/emiCalculator';

const LoanApplication = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: 1000,
    tenure_months: 12,
    interest_rate: 12.0,
    purpose: '',
    employment_status: 'Employed',
    monthly_income: 5000,
  });
  const [submitting, setSubmitting] = useState(false);

  const emiInfo = calculateEMI(form.amount, form.interest_rate, form.tenure_months);
  const affordability = checkAffordability(form.monthly_income, emiInfo.emi);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name.includes('amount') || name.includes('income') || name.includes('interest') || name.includes('tenure') ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Build repayment schedule
      const schedule = generateRepaymentSchedule(form.amount, form.interest_rate, form.tenure_months);
      const payload = {
        ...form,
        emi: emiInfo.emi,
        repayment_schedule: schedule,
      };
      const res = await createLoan(payload);
      toast.success('Loan application submitted');
      navigate(`/loan/${res.data.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to submit loan application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">Apply for Loan</h1>
      <form className="card space-y-6" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="label">Amount ($)</label>
            <input name="amount" type="number" min="100" max="5000" className="input-field" value={form.amount} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Tenure (months)</label>
            <input name="tenure_months" type="number" min="3" max="36" className="input-field" value={form.tenure_months} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Interest Rate (%)</label>
            <input name="interest_rate" type="number" step="0.01" className="input-field" value={form.interest_rate} onChange={handleChange} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="label">Purpose</label>
            <input name="purpose" type="text" className="input-field" value={form.purpose} onChange={handleChange} placeholder="e.g., Home Renovation" />
          </div>
          <div>
            <label className="label">Employment Status</label>
            <select name="employment_status" className="input-field" value={form.employment_status} onChange={handleChange}>
              <option>Employed</option>
              <option>Self-Employed</option>
              <option>Student</option>
              <option>Unemployed</option>
            </select>
          </div>
          <div>
            <label className="label">Monthly Income ($)</label>
            <input name="monthly_income" type="number" min="0" className="input-field" value={form.monthly_income} onChange={handleChange} />
          </div>
        </div>

        {/* EMI Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 rounded border border-neutral-200">
            <p className="text-sm text-neutral-600">Estimated EMI</p>
            <p className="text-2xl font-bold">{formatCurrency(emiInfo.emi)}</p>
          </div>
          <div className="p-4 rounded border border-neutral-200">
            <p className="text-sm text-neutral-600">Total Interest</p>
            <p className="text-2xl font-bold">{formatCurrency(emiInfo.totalInterest)}</p>
          </div>
          <div className="p-4 rounded border border-neutral-200">
            <p className="text-sm text-neutral-600">Affordability</p>
            <p className={`text-sm font-medium ${affordability.affordable ? 'text-green-600' : 'text-red-600'}`}>{affordability.message} (EMI/Income: {affordability.ratio}%)</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={submitting || !form.purpose}>
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplication;
