import React, { useState, useEffect } from "react";
import "./layout.css";

const Layout = ({ children }) => {

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    const handleResize = () => {

      if(window.innerWidth <= 1000){
        setIsMobile(true);
        setSidebarOpen(false);
      }else{
        setIsMobile(false);
        setSidebarOpen(true);
      }

    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);

  return (

    <div className="layout-container">

      {/* SIDEBAR */}

      <aside className={`sidebar-glass ${sidebarOpen ? "open" : ""}`}>

        <h4 className="logo">MODERN POS</h4>

        <ul className="sidebar-menu">

          <li className="nav-link">
            <span className="icon">📊</span>
            <span className="menu-text">Dashboard</span>
          </li>

          <li className="nav-link">
            <span className="icon">🛒</span>
            <span className="menu-text">Cashier</span>
          </li>

          <li className="nav-link">
            <span className="icon">📦</span>
            <span className="menu-text">Products</span>
          </li>

          <li className="nav-link">
            <span className="icon">📊</span>
            <span className="menu-text">Stock</span>
          </li>

        </ul>

      </aside>

      {/* OVERLAY MOBILE */}

      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN */}

      <div className="main-area">

        {/* NAVBAR */}

        <div className="navbar-glass">

          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

        </div>

        <div className="content-area">
          {children}
        </div>

      </div>

    </div>

  );

};

export default Layout;
