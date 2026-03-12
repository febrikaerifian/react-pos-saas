import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TransactionsOwner = () => {
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null;

  const today = new Date();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [transactions, setTransactions] = useState([]);

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    if (user?.role !== 'cashier') fetchBranches();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedBranch, startDate, endDate]);

  const fetchBranches = async () => {
    const res = await api.get('/api/branches');
    setBranches(res.data);
  };

  const fetchTransactions = async () => {
    try {
      const params = {
        branch_id: selectedBranch || undefined,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate)
      };

      const res = await api.get('/api/transactions', { params });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
  };

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div
        style={{
          background: 'linear-gradient(90deg, #36d1dc 0%, #5b86e5 100%)',
          padding: '25px',
          borderRadius: '14px',
          color: '#fff',
          marginBottom: '25px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
        }}
      >
        <div className="d-flex justify-content-between flex-wrap align-items-end">
          <div>
            <h2 style={{ fontWeight: 700, marginBottom: 5 }}>📋 Transaction Report</h2>
            <small style={{ opacity: 0.9 }}>Monitor all sales transactions by branch & date</small>
          </div>

          <div className="d-flex gap-3 flex-wrap">

            {/* Branch Filter */}
            {user?.role !== 'cashier' && (
              <div style={{ minWidth: 180 }}>
                <label className="form-label mb-1 text-light">Branch</label>
                <select
                  className="form-select shadow-sm"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  style={{ borderRadius: 10 }}
                >
                  <option value="">All Branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div style={{ minWidth: 280 }}>
              <label className="form-label mb-1 text-light">Date Range</label>
              <div className="d-flex gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="form-control shadow-sm"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  minDate={startDate}
                  className="form-control shadow-sm"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SUMMARY CARD */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 text-center">
            <div className="card-body">
              <h6 className="text-muted">Total Transactions</h6>
              <h3 className="fw-bold text-primary">
                {transactions.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 text-center">
            <div className="card-body">
              <h6 className="text-muted">Total Sales</h6>
              <h3 className="fw-bold text-success">
                Rp {transactions
                  .reduce((sum, t) => sum + Number(t.total || 0), 0)
                  .toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">

          <h5 className="mb-3 fw-bold">📊 Transactions List</h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>Invoice</th>
                  <th>Cashier</th>
                  <th>Branch</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="fw-semibold text-primary">
                        {tx.invoice_number}
                      </td>
                      <td>{tx.cashier_name}</td>
                      <td>
                        <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                          {tx.branch_name || tx.branch_id}
                        </span>
                      </td>
                      <td className="fw-bold text-success">
                        Rp {Number(tx.total).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${
                          tx.payment_method === 'CASH'
                            ? 'bg-success'
                            : 'bg-warning text-dark'
                        }`}>
                          {tx.payment_method}
                        </span>
                      </td>
                      <td>
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  );
};

export default TransactionsOwner;