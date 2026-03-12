import React, { useEffect, useState, useCallback } from 'react'; 
import { Container, Typography, Button, TextField, Select, MenuItem, Box, IconButton, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

const Products = () => {
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name:'', price:'', stock:'' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : null; 
  const isAdmin = user?.role === 'admin';

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/branches');
      setBranches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/products?branch_id=${branchId}&search=${search}`);
      setRows(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [branchId, search]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock || !branchId) {
      alert('Please fill all fields!');
      return;
    }
    try {
      if (editId) {
        await api.put(`/api/products/${editId}`, { ...form, branch_id: branchId });
      } else {
        await api.post('/api/products', { ...form, branch_id: branchId });
      }
      setForm({ name:'', price:'', stock:'' });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Product', flex: 2, minWidth: 150 },
    { field: 'price', headerName: 'Price', flex: 1, minWidth: 100 },
    { 
      field: 'stock', 
      headerName: 'Stock', 
      flex: 1, 
      minWidth: 100,
      renderCell: (params) => (
        <span style={{ color: params.value < 5 ? 'red' : 'green', fontWeight: 'bold' }}>
          {params.value}
        </span>
      )
    },
    ...(isAdmin ? [{
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Box>
          <IconButton color="primary" size="small" onClick={() => { setEditId(params.row.id); setForm(params.row); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }] : [])
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
       <h4
    className="mb-3 fw-bold text-primary"
    style={{
      fontSize: '1.75rem',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
      display: 'inline-block',
      paddingBottom: '4px'
    }}
  >
    🗂️ Product Management
  </h4>

      {/* FORM & FILTER INLINE SESUAI LEBAR DATAGRID */}
      <Box sx={{
        mb: 2,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        width: '100%',
        maxWidth: '100%',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, flex: 1 }}>
          {isAdmin && (
            <FormControl sx={{ minWidth: 160, flex: 1 }}>
              <InputLabel>Branch</InputLabel>
              <Select value={branchId} onChange={e=>setBranchId(e.target.value)} label="Branch">
                <MenuItem value="">All Branch</MenuItem>
                {branches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}

          <TextField
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 160, flex: 1 }}
          />

          {isAdmin && (
            <>
              <TextField
                label="Name"
                value={form.name}
                onChange={e=>setForm({...form, name: e.target.value})}
                sx={{ minWidth: 160, flex: 1 }}
              />
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={e=>setForm({...form, price: e.target.value})}
                sx={{ minWidth: 120, flex: 1 }}
              />
              <TextField
                label="Stock"
                type="number"
                value={form.stock}
                onChange={e=>setForm({...form, stock: e.target.value})}
                sx={{ minWidth: 100, flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleSave}
                sx={{
                  minWidth: 120,
                  flex: 1,
                  background: editId ? 'linear-gradient(to right, #f6d365, #fda085)' : 'linear-gradient(to right, #36d1dc, #5b86e5)',
                  fontWeight: 600,
                  '&:hover': { opacity: 0.9 }
                }}
              >
                {editId ? 'Update' : 'Add'}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* DATA TABLE */}
      <Box sx={{ width: '100%', overflowX: 'auto', borderRadius: 2, boxShadow: 1 }}>
        <div style={{ height: 'calc(100vh - 300px)', minWidth: 700 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            rowsPerPageOptions={[5,10,20,50]}
            pagination
            loading={loading}
            disableColumnMenu
            autoHeight={false}
            rowHeight={40}
            sx={{
              '& .MuiDataGrid-root': { border: 'none', fontSize: 14 },
              '& .MuiDataGrid-cell': { whiteSpace: 'nowrap', py: 1 },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5', fontWeight: 600 },
              '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(33,150,243,0.08)' }
            }}
          />
        </div>
      </Box>
    </Container>
  );
};

export default Products;