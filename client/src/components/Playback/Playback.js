import React, { useEffect } from "react";
import Scrubber from "../Scrubber/Scrubber";
import "./Playback.css";

function Playback(props) {
  useEffect(() => {
    function handleKeyUp(e) {
      if (e.key === " " && props.player) {
        props.player.togglePlay();
      }
    }

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [props.player]);

  function togglePlayStatus() {
    props.player.togglePlay();
  }

  function nextTrack() {
    props.player.nextTrack();
  }

  function previousTrack() {
    props.player.getCurrentState().then((state) => {
      if (state.position > 3000) {
        props.player.seek("0");
      } else {
        props.player.previousTrack();
      }
    });
  }

  return (
    <div className="playback">
      {props.track !== "" ? (
        <div className="playback-container">
          <h3 className="track">{props.track}</h3>
          <h4 className="artist">{props.artist}</h4>
          <Scrubber player={props.player} />
          <div className="media-controls">
            <button type="button" className="previous" onClick={previousTrack}>
              <i className="fas fa-angle-double-left fa-lg"></i>
            </button>
            <button
              type="button"
              className="toggle-play"
              onClick={togglePlayStatus}
            >
              {props.isPlaying ? (
                <i className="fas fa-circle-pause fa-2x"></i>
              ) : (
                <i className="fa-solid fa-circle-play fa-2x"></i>
              )}
            </button>
            <button type="button" className="next" onClick={nextTrack}>
              <i className="fas fa-angle-double-right fa-lg"></i>
            </button>
          </div>
        </div>
      ) : (
        <div className="spinner">
          <i className="fa-solid fa-compact-disc fa-3x fa-spin"></i>
        </div>
      )}
    </div>
  );
}

export default Playback;
