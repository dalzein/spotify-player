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
      <div className="header-left">
        <img src="/android-chrome-192x192.png" alt="logo"></img>
      </div>
      {props.user !== "" && (
        <div className="header-right">
          <p>{props.user}</p>
          <button className="sign-out" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}

export default Nav;
