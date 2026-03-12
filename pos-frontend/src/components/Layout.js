import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Layout = ({ children }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      year: "numeric",
    });
  };

  return (
    <div className="layout-container">

      {/* SIDEBAR */}
      <div className={`sidebar-glass ${sidebarOpen ? "open" : ""}`}>

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
                📦 Product
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
      </div>

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
        <div className="navbar-top">

          <div className="navbar-left">

            {/* HAMBURGER */}
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

          {/* RIGHT */}
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

        </div>

        {/* CONTENT */}
        <div className="content-area">
          {children}
        </div>

      </div>

      {/* STYLE */}
      <style>{`

      .layout-container{
        display:flex;
      }

      /* SIDEBAR */

      .sidebar-glass{

        position:fixed;
        left:0;
        top:0;
        width:240px;
        height:100vh;

        background:rgba(0,0,0,0.75);
        backdrop-filter:blur(10px);

        padding:20px;
        z-index:1000;

        transition:transform .3s ease;

      }

      .logo{

        color:white;
        text-align:center;
        margin-bottom:30px;
        font-weight:700;

      }

      .sidebar-menu{
        list-style:none;
        padding:0;
      }

      .sidebar-menu li{
        margin-bottom:10px;
      }

      .sidebar-menu .nav-link{

        display:block;
        padding:10px 14px;
        color:#ddd;
        text-decoration:none;
        border-radius:10px;
        transition:.2s;

      }

      .sidebar-menu .nav-link:hover{

        background:rgba(255,255,255,0.1);
        color:white;

      }

      .active-menu{

        background:white;
        color:black !important;
        font-weight:600;

      }

      /* MAIN */

      .main-area{

        margin-left:240px;
        width:100%;

      }

      /* NAVBAR */

      .navbar-top{

        display:flex;
        justify-content:space-between;
        align-items:center;

        background:linear-gradient(90deg,#f8f9fa,#e9ecef,#ffffff);

        padding:16px 24px;

        border-bottom:1px solid #e5e5e5;

      }

      .navbar-left{
        display:flex;
        align-items:center;
        gap:15px;
      }

      .menu-btn{

        border:none;
        background:white;
        border-radius:6px;
        padding:5px 10px;
        font-size:18px;

      }

      .welcome{

        margin:0;
        font-weight:600;
      }

      .role-badge{

        background:#6c757d;
        color:white;
        border-radius:6px;
        padding:3px 8px;
        margin-left:8px;
        font-size:12px;

      }

      .clock{

        background:white;
        padding:6px 10px;
        border-radius:8px;
        border:1px solid #ddd;
        font-weight:600;

      }

      .navbar-right{
        display:flex;
        align-items:center;
        gap:20px;
      }

      /* CONTENT */

      .content-area{

        padding:24px;
        background:#f4f6fb;
        min-height:calc(100vh - 70px);

      }

      /* MOBILE */

      @media(max-width:768px){

        .sidebar-glass{
          transform:translateX(-100%);
        }

        .sidebar-glass.open{
          transform:translateX(0);
        }

        .main-area{
          margin-left:0;
        }

      }

      .sidebar-overlay{

        position:fixed;
        top:0;
        left:0;
        width:100%;
        height:100%;

        background:rgba(0,0,0,0.4);
        z-index:900;

      }

      `}</style>

    </div>
  );
};

export default Layout;