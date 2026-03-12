import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Swal from 'sweetalert2';

const Branches = () => {

  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/api/branches');
      setBranches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreate = () => {
    setEditing(false);
    setForm({ id: null, name: '', address: '', phone: '' });
    setShowModal(true);
  };

  const openEdit = (branch) => {
    setEditing(true);
    setForm(branch);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/api/branches/${form.id}`, form);
        Swal.fire('Success', 'Branch updated successfully', 'success');
      } else {
        await api.post('/api/branches', form);
        Swal.fire('Success', 'Branch created successfully', 'success');
      }

      setShowModal(false);
      fetchBranches();

    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This branch will be deleted',
      icon: 'warning',
      showCancelButton: true
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/api/branches/${id}`);
        Swal.fire('Deleted!', 'Branch removed', 'success');
        fetchBranches();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Cannot delete', 'error');
      }
    }
  };

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div
        style={{
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          padding: '25px',
          borderRadius: '14px',
          color: '#fff',
          marginBottom: '25px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 style={{ fontWeight: 700 }}>🏢 Branch Management</h2>
            <small>Manage your company branches</small>
          </div>

          <button
            className="btn btn-light shadow-sm"
            style={{ borderRadius: 10 }}
            onClick={openCreate}
          >
            + Add Branch
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Created</th>
                  <th width="150">Action</th>
                </tr>
              </thead>
              <tbody>
                {branches.length > 0 ? (
                  branches.map(b => (
                    <tr key={b.id}>
                      <td className="fw-semibold text-primary">
                        {b.name}
                      </td>
                      <td>{b.address || '-'}</td>
                      <td>{b.phone || '-'}</td>
                      <td>
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEdit(b)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(b.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No branches available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content rounded-4 border-0 shadow">

              <div className="modal-header">
                <h5 className="modal-title">
                  {editing ? 'Edit Branch' : 'Add Branch'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">

                  <div className="mb-3">
                    <label className="form-label">Branch Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {editing ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Branches;