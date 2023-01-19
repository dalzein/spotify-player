import React, { useEffect, useState } from "react";
import { getToken } from "../../services/TokenService";
import Playback from "../Playback/Playback";
import Search from "../Search/Search";
import "./Media.css";

function Media() {
  const [{ player, deviceId }, setPlayer] = useState({
    player: "",
    deviceId: "",
  });
  const [{ track, artist, isPlaying }, setTrackDetails] = useState({
    track: "",
    artist: "",
    isPlaying: false,
  });

  useEffect(() => {
    const handleScriptLoad = new Promise((resolve) => {
      if (window.Spotify) {
        resolve();
      } else {
        window.onSpotifyWebPlaybackSDKReady = resolve;
      }
    });

    handleScriptLoad.then(() => {
      getToken().then((token) => {
        const newPlayer = new window.Spotify.Player({
          name: "Deciball",
          getOauthToken: async (callback) => {
            callback(await getToken());
          },
        });

        newPlayer.addListener("ready", ({ device_id }) => {
          console.log("Ready with Device ID", device_id);

          // This is required for Chrome due to their iframe policy
          const iframe = document.querySelector(
            'iframe[src="https://sdk.scdn.co/embedded/index.html"]'
          );

          if (iframe) {
            iframe.style.display = "block";
            iframe.style.position = "absolute";
            iframe.style.top = "-1000px";
            iframe.style.left = "-1000px";
          }

          fetch("https://api.spotify.com/v1/me/player", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ device_ids: [device_id] }),
          }).then(() => {
            setPlayer({
              player: newPlayer,
              deviceId: device_id,
            });
          });
        });

        newPlayer.addListener("player_state_changed", (state) => {
          console.log(state);
          if (state) {
            setTrackDetails({
              track: state.track_window.current_track.name,
              artist: state.track_window.current_track.artists[0].name,
              isPlaying: !state.paused,
            });
          }
        });

        newPlayer.connect();
      });
    });
  }, []);

  function playSelectedTrack(trackURI) {
    getToken().then((token) => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        body: JSON.stringify({ uris: [trackURI] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });
  }

  return (
    <div>
      <Search playSelectedTrack={playSelectedTrack} deviceId={deviceId} />
      <Playback
        player={player}
        track={track}
        artist={artist}
        isPlaying={isPlaying}
      />
    </div>
  );
}

export default Media;
