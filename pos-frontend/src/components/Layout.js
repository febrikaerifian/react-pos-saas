import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/layout.css";

const Layout = ({ children }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* CLOCK */
  useEffect(() => {

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  /* AUTO CLOSE SIDEBAR ON DESKTOP */
  useEffect(() => {

    const handleResize = () => {
      if (window.innerWidth > 992) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

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
      year: "numeric",
    });
  };

  return (

    <div className="layout-container">

      {/* SIDEBAR */}

      <aside className={`sidebar-glass ${sidebarOpen ? "open" : ""}`}>

        <h4 className="logo">
          MODERN POS
        </h4>

        <ul className="sidebar-menu">

          <li>
            <Link
              className={isActive("/dashboard")}
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
            >
              📊 Dashboard
            </Link>
          </li>

          {user?.role === "cashier" && (
            <li>
              <Link
                className={isActive("/cashier")}
                to="/cashier"
                onClick={() => setSidebarOpen(false)}
              >
                🛒 Cashier
              </Link>
            </li>
          )}

          {user?.role === "admin" && (
            <li>
              <Link
                className={isActive("/products")}
                to="/products"
                onClick={() => setSidebarOpen(false)}
              >
                📦 Products
              </Link>
            </li>
          )}

          {(user?.role === "owner" || user?.role === "cashier") && (
            <li>
              <Link
                className={isActive("/stock")}
                to="/stock"
                onClick={() => setSidebarOpen(false)}
              >
                📊 Stock Monitoring
              </Link>
            </li>
          )}

          {user?.role === "owner" && (
            <>
              <li>
                <Link
                  className={isActive("/transactions")}
                  to="/transactions"
                  onClick={() => setSidebarOpen(false)}
                >
                  🧾 Transactions
                </Link>
              </li>

              <li>
                <Link
                  className={isActive("/branches")}
                  to="/branches"
                  onClick={() => setSidebarOpen(false)}
                >
                  🏢 Branches
                </Link>
              </li>

              <li>
                <Link
                  className={isActive("/users")}
                  to="/users"
                  onClick={() => setSidebarOpen(false)}
                >
                  👤 Users
                </Link>
              </li>
            </>
          )}

        </ul>

      </aside>

      {/* OVERLAY MOBILE */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
