import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Visualiser from "../Visualiser/Visualiser";
import Media from "../Media/Media";
import { getCookieValue, getToken } from "../../services/TokenService";
import "./App.css";

function App() {
  const [user, setUser] = useState("");
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState(false);

  useEffect(() => {
    navigator.permissions
      .query({ name: "microphone" })
      .then((permissionStatus) => {
        setHasMicrophoneAccess(permissionStatus.state === "granted");
        permissionStatus.onchange = () =>
          setHasMicrophoneAccess(permissionStatus.state === "granted");
      });
  }, []);

  useEffect(() => {
    if (!user && getCookieValue("spotifyRefreshToken")) {
      getToken().then((token) => {
        if (token) {
          fetch("https://api.spotify.com/v1/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => response.json())
            .then((json) => {
              if (json.product === "premium") {
                setUser(json.id);
              } else {
                handleSignOut();
              }
            })
            .catch(() => handleSignOut());
        } else {
          window.location.reload();
        }
      });
    }
  });

  function handleLogin() {
    fetch("/api/login")
      .then((response) => response.json())
      .then((json) => (window.location = json.url));
  }

  function handleSignOut() {
    fetch("/api/logout").then(() => {
      window.location.reload();
    });
  }

  return (
    <div>
      <Header onLogout={handleSignOut} user={user} />
      <Visualiser hasMicrophoneAccess={hasMicrophoneAccess} />
      {user !== "" && <Media />}
      {getCookieValue("spotifyRefreshToken") === "" && (
        <div className="info">
          {!hasMicrophoneAccess && (
            <p className="microphone-access-required">
              Microphone access is required for the visualiser to work
            </p>
          )}
          <p>Sign in to search for and play Spotify music</p>
          <button className="sign-in" onClick={handleLogin}>
            <i className="fab fa-spotify"></i> &nbsp;Sign in with Spotify
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
