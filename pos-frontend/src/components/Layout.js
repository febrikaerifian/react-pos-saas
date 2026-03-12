import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./layout.css";

const Layout = ({ children }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* CLOCK */
  useEffect(() => {

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "nav-link active-menu"
      : "nav-link";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (

    <div className={`layout-container ${sidebarOpen ? "" : "collapsed"}`}>

      {/* SIDEBAR */}

      <aside className="sidebar-glass">

        <h4 className="logo">
          MODERN POS
        </h4>

        <ul className="sidebar-menu">

          <li>
            <Link className={isActive("/dashboard")} to="/dashboard">
              <span className="icon">📊</span>
              <span className="menu-text">Dashboard</span>
            </Link>
          </li>

          {user?.role === "cashier" && (
            <li>
              <Link className={isActive("/cashier")} to="/cashier">
                <span className="icon">🛒</span>
                <span className="menu-text">Cashier</span>
              </Link>
            </li>
          )}

          {user?.role === "admin" && (
            <li>
              <Link className={isActive("/products")} to="/products">
                <span className="icon">📦</span>
                <span className="menu-text">Products</span>
              </Link>
            </li>
          )}

          {(user?.role === "owner" || user?.role === "cashier") && (
            <li>
              <Link className={isActive("/stock")} to="/stock">
                <span className="icon">📊</span>
                <span className="menu-text">Stock Monitoring</span>
              </Link>
            </li>
          )}

          {user?.role === "owner" && (
            <>
              <li>
                <Link className={isActive("/transactions")} to="/transactions">
                  <span className="icon">🧾</span>
                  <span className="menu-text">Transactions</span>
                </Link>
              </li>

              <li>
                <Link className={isActive("/branches")} to="/branches">
                  <span className="icon">🏢</span>
                  <span className="menu-text">Branches</span>
                </Link>
              </li>

              <li>
                <Link className={isActive("/users")} to="/users">
                  <span className="icon">👤</span>
                  <span className="menu-text">Users</span>
                </Link>
              </li>
            </>
          )}

        </ul>

      </aside>

      {/* MAIN AREA */}

      <div className="main-area">

        {/* NAVBAR */}

        <header className="navbar-top">

          <div className="navbar-left">

            <button
              className="menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            <div>

              <h5 className="welcome">

                Welcome

                <span className="role-badge">
                  {user?.role || "USER"}
                </span>

              </h5>

              <small className="date">
                {formatDate(time)}
              </small>

            </div>

          </div>

          <div className="navbar-right">

            <div className="clock">
              🕒 {formatTime(time)}
            </div>

            <div className="dropdown">

              <button
                className="btn btn-light dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                {user?.name || "User"}
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow">

                <li className="px-3 py-2">

                  <strong>{user?.name}</strong>
                  <br />

                  <small className="text-muted">
                    {user?.role}
                  </small>

                </li>

                <li><hr /></li>

                <li className="px-3 pb-3">

                  <button
                    className="btn btn-danger btn-sm w-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>

                </li>

              </ul>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <main className="content-area">
          {children}
        </main>

      </div>

    </div>

  );

};

export default Layout;
