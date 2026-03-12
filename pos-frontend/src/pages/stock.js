import React, { useEffect, useState } from 'react';
import api from '../api/api';

const StockManagement = () => {

  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [search, setSearch] = useState('');

  // 📄 Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchStock();
  }, [selectedBranch]);

  useEffect(() => {
    setCurrentPage(1); // reset page when filter changes
  }, [search, selectedBranch]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/api/branches');
      setBranches(res.data);
    } catch (err) {
      console.error("FETCH BRANCH ERROR:", err);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await api.get('/api/stock', {
        params: selectedBranch
          ? { branch_id: Number(selectedBranch) }
          : {}
      });
      setProducts(res.data);
    } catch (err) {
      console.error("FETCH STOCK ERROR:", err);
    }
  };

  // 🔎 Search Filter
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

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
        <h2 className="fw-bold mb-1">📊 Stock Monitoring</h2>
        <small>View product stock by branch</small>
      </div>

      {/* FILTER & SEARCH */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <select
            className="form-select"
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
          >
            <option value="">All Branch</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="🔎 Search product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* STOCK TABLE */}
      <div className="card shadow-sm rounded-4">
        <div className="card-body">

          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Branch</th>
                <th>Stock</th>
                <th>Sold</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No product found
                  </td>
                </tr>
              ) : (
                currentProducts.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.branch_name || '-'}</td>

                    {/* STOCK BADGE */}
                    <td>
                      <span className={`badge ${
                        p.stock <= 5 ? 'bg-danger' :
                        p.stock <= 20 ? 'bg-warning text-dark' :
                        'bg-success'
                      }`}>
                        {p.stock}
                      </span>
                    </td>

                    {/* SOLD BADGE */}
                    <td>
                      <span className={`badge ${
                        p.sold > 0 ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        {p.sold}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>

          {/* PAGINATION */}
          {filteredProducts.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">

              <small className="text-muted">
                Showing {indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, filteredProducts.length)}{" "}
                of {filteredProducts.length}
              </small>

              <div className="btn-group">
                <button
                  className="btn btn-outline-primary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  ← Previous
                </button>

                <button
                  className="btn btn-outline-primary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next →
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default StockManagement;