import React from "react";
import "./css/SideMenu.css";

const SideMenu = ({ isOpen, onClose, children }) => {
  return (
    <>
      <div className={`side-menu ${isOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="menu-content">{children}</div>
      </div>
      {isOpen && <div className="side-menu-backdrop" onClick={onClose}></div>}
    </>
  );
};

export default SideMenu;
