import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLoans } from '../services/loanService';
import { formatCurrency } from '../utils/emiCalculator';

const LoanHistory = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Consider 'repaid' as history, include 'disbursed' to show live history items
        const res = await getLoans({ status: 'repaid,disbursed' });
        setLoans(res.data || []);
      } catch (e) {
        console.error('Failed to fetch loan history', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Loan History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : loans.length === 0 ? (
        <div className="card">
          <p className="text-neutral-600">No historical loans to show.</p>
          <Link to="/loan/apply" className="btn-primary mt-4 inline-block">Apply for a Loan</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Applied</th>
                <th className="p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.id}</td>
                  <td className="p-2">{formatCurrency(l.amount)}</td>
                  <td className="p-2 capitalize">{l.status}</td>
                  <td className="p-2">{new Date(l.application_date).toLocaleDateString()}</td>
                  <td className="p-2"><Link to={`/loan/${l.id}`} className="text-primary-500">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoanHistory;
