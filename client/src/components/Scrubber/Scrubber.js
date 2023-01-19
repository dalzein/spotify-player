import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Scrubber.css";

function Scrubber(props) {
  const scrubberRef = useRef(null);

  const [{ trackPosition, trackDuration, isScrubbing }, setTrackTimeData] =
    useState({
      trackPosition: 0,
      trackDuration: 0,
      isScrubbing: false,
    });

  useEffect(() => {
    let timeout;

    // Sync track's time position if scrubber isn't being manually dragged
    if (!isScrubbing) {
      timeout = setInterval(() => {
        props.player.getCurrentState().then(({ position, duration }) => {
          setTrackTimeData((previousValue) => ({
            ...previousValue,
            trackPosition: position,
            trackDuration: duration,
          }));
        });
      }, 100);
    }

    return () => clearInterval(timeout);
  }, [props.player, isScrubbing]);

  // Work out the targeted track timestamp based the horizontal position of the mouse relative to the scrubber line
  const calculateNewTrackTimePosition = useCallback(
    (mouseX) => {
      const scrubberOffsetX = scrubberRef.current.getBoundingClientRect().x;
      const scrubberWidth = 160;
      let newPositionOffset =
        Math.max(scrubberOffsetX, mouseX) - scrubberOffsetX;
      newPositionOffset =
        newPositionOffset > scrubberWidth ? scrubberWidth : newPositionOffset;
      return Math.round((newPositionOffset * trackDuration) / scrubberWidth);
    },
    [trackDuration]
  );

  function handleMouseDown(e) {
    // Mobile and touch devices use e.changedTouches
    if (e.changedTouches && e.changedTouches.length) {
      e = e.changedTouches[0];
    }

    if (e.button === 2) return;

    const newTrackTimePosition = calculateNewTrackTimePosition(e.pageX);

    setTrackTimeData((previousValue) => ({
      ...previousValue,
      trackPosition: newTrackTimePosition,
      isScrubbing: true,
    }));
  }

  // Attach mouse move and mouse up listeners to the window
  useEffect(() => {
    function handleMouseMove(e) {
      if (e.changedTouches && e.changedTouches.length) {
        e = e.changedTouches[0];
      }

      if (isScrubbing) {
        const newTrackTimePosition = calculateNewTrackTimePosition(e.pageX);

        setTrackTimeData((previousValue) => ({
          ...previousValue,
          trackPosition: newTrackTimePosition,
        }));
      }
    }

    // Update track position
    function handleMouseUp() {
      props.player.seek(trackPosition);

      setTrackTimeData((previousValue) => ({
        ...previousValue,
        isScrubbing: false,
      }));
    }

    if (isScrubbing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [
    calculateNewTrackTimePosition,
    isScrubbing,
    props.player,
    trackDuration,
    trackPosition,
  ]);

  function padToTwoDigits(num) {
    return num.toString().padStart(2, "0");
  }

  function getPositionInMinutesAndSeconds(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    return seconds === 60
      ? `${padToTwoDigits(minutes + 1)}:00`
      : `${padToTwoDigits(minutes)}:${padToTwoDigits(seconds)}`;
  }

  return (
    <div className="scrubber">
      <div className="scrubber-container">
        <span className="time">
          {getPositionInMinutesAndSeconds(trackPosition)}
        </span>
        <div
          className="scrubber-timeline"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="scrubber-line" ref={scrubberRef}>
            <button
              className="scrubber-circle"
              style={{
                left: `calc(${
                  (trackPosition * 100) / trackDuration
                }% - 0.375rem)`,
              }}
            ></button>
          </div>
        </div>
        <span className="time">
          {getPositionInMinutesAndSeconds(trackDuration)}
        </span>
      </div>
    </div>
  );
}

export default Scrubber;
