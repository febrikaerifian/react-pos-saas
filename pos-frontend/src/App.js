import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Products from './pages/products';
import Transactions from './pages/transactions';
import Branches from './pages/branches';
import Layout from './components/Layout';
import Cashier from './pages/cashier';
import Users from './pages/users';
import Stock from './pages/stock';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
        path="/cashier"
        element={
         <PrivateRoute>
      <Layout>
        <Cashier />
      </Layout>
    </PrivateRoute>
  }
/>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Layout>
                <Products />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Layout>
                <Transactions />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/branches"
          element={
            <PrivateRoute>
              <Layout>
                <Branches />
              </Layout>
            </PrivateRoute>
          }
        />

         <Route
          path="/users"
          element={
            <PrivateRoute>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <PrivateRoute>
              <Layout>
                <Stock />
              </Layout>
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;