import React, { useState } from "react";
import "./Header.css";

function Nav(props) {
  const [loggingOut, setLoggingOut] = useState(false);

  function handleLogout() {
    if (loggingOut) return;

    props.onLogout();
    setLoggingOut(true);
  }

  return (
    <header>
      <nav className="nav">
        <div className="nav-left">
          <img src="/icon.svg" alt="icon"></img>
        </div>
        {props.user !== "" && (
          <div className="nav-right">
            <p>{props.user}</p>
            <button className="sign-out" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Nav;
