import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getLoanById } from '../services/loanService';
import { getPaymentsByLoan } from '../services/paymentService';
import { formatCurrency } from '../utils/emiCalculator';

const LoanDetails = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const l = await getLoanById(id);
        setLoan(l.data);
        const p = await getPaymentsByLoan(id);
        setPayments(p.data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load loan');
      }
    };
    load();
  }, [id]);

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
    repaid: 'text-neutral-700',
  }[loan.status] || 'text-neutral-700';

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-2">Loan #{loan.id}</h1>
      <p className={`mb-6 font-medium ${statusColor}`}>Status: {loan.status}</p>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-2">Summary</h3>
          <ul className="text-sm space-y-1">
            <li>Amount: {formatCurrency(loan.amount)}</li>
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
                  {loan.repayment_schedule.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{row.month}</td>
                      <td className="p-2">{row.due_date}</td>
                      <td className="p-2">{formatCurrency(row.amount)}</td>
                      <td className="p-2">{formatCurrency(row.principal)}</td>
                      <td className="p-2">{formatCurrency(row.interest)}</td>
                      <td className="p-2">{formatCurrency(row.balance)}</td>
                      <td className="p-2 capitalize">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-neutral-600">No schedule available.</p>
          )}
        </div>
      </div>

      <div className="card">
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
