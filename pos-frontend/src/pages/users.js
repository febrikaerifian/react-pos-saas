import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Swal from 'sweetalert2';

const Users = () => {

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    id: null,
    branch_id: '',
    name: '',
    email: '',
    password: '',
    role: 'cashier'
  });

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get('/api/users');
    setUsers(res.data);
  };

  const fetchBranches = async () => {
    const res = await api.get('/api/branches');
    setBranches(res.data);
  };

  const openCreate = () => {
    setEditing(false);
    setForm({ id: null, branch_id: '', name: '', email: '', password: '', role: 'cashier' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(true);
    setForm({ ...user, password: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.put(`/api/users/${form.id}`, form);
        Swal.fire('Success', 'User updated', 'success');
      } else {
        await api.post('/api/users', form);
        Swal.fire('Success', 'User created', 'success');
      }

      setShowModal(false);
      fetchUsers();

    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete this user?',
      icon: 'warning',
      showCancelButton: true
    });

    if (confirm.isConfirmed) {
      await api.delete(`/api/users/${id}`);
      fetchUsers();
      Swal.fire('Deleted', 'User removed', 'success');
    }
  };

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="p-4 rounded-4 mb-4 shadow-sm d-flex justify-content-between align-items-center"
       style={{
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          padding: '25px',
          borderRadius: '14px',
          color: '#fff',
          marginBottom: '25px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
        }}
      >
        <div>
          <h2 className="fw-bold">👥 User Management</h2>
          <small>Manage users & roles</small>
        </div>

        <button className="btn btn-light" onClick={openCreate}>
          + Add User
        </button>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Role</th>
                  <th width="150">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="fw-semibold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.branch_name || '-'}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEdit(u)}>Edit</button>

                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content rounded-4">

              <div className="modal-header">
                <h5>{editing ? 'Edit User' : 'Add User'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">

                  <input className="form-control mb-3"
                    placeholder="Name"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required />

                  <input className="form-control mb-3"
                    placeholder="Email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    required />

                  <input type="password"
                    className="form-control mb-3"
                    placeholder={editing ? "Leave blank if not changing" : "Password"}
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required={!editing} />

                  <select className="form-select mb-3"
                    value={form.role}
                    onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="cashier">Cashier</option>
                  </select>

                  <select className="form-select"
                    value={form.branch_id || ''}
                    onChange={e => setForm({...form, branch_id: e.target.value})}>
                    <option value="">No Branch</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>

                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" type="button"
                    onClick={() => setShowModal(false)}>Cancel</button>

                  <button className="btn btn-primary" type="submit">
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

export default Users;