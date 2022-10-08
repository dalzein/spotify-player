import React, { useEffect, useState } from "react";
import { getToken } from "../../services/TokenService";
import "./Search.css";

function Search(props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    function fetchTrackResults() {
      if (query !== "") {
        getToken().then((token) => {
          fetch(
            `https://api.spotify.com/v1/search?q=${query}&limit=8&type=track`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
            .then((response) => response.json())
            .then((json) => {
              const trackResults = json.tracks.items.map((item) => ({
                trackName: item.name,
                artist: item.artists[0].name,
                uri: item.uri,
              }));
              setResults(trackResults);
            });
        });
      } else {
        setResults([]);
      }
    }

    // Debounce API calls for search
    const timeout = setTimeout(fetchTrackResults, 300);

    return () => clearTimeout(timeout);
  }, [props, query]);

  function handleChange(e) {
    setQuery(e.target.value.replace(/`|\\|^\s+/gm, ""));
  }

  function handleClick(e) {
    props.playSelectedTrack(e.currentTarget.id);
    setQuery("");
  }

  function handleFocus() {
    setShowResults(true);
  }

  function handleBlur() {
    setShowResults(false);
  }

  return (
    <div className="search-area">
      <div className="search-container">
        <input
          type="text"
          className={`${
            results.length > 0 && showResults ? "has-results" : ""
          } search-bar`}
          placeholder="Search for a Spotify track"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          spellCheck="false"
          onKeyUp={(e) => e.stopPropagation()}
        ></input>
        {showResults && (
          <div
            className={`${
              results.length > 0 && showResults ? "has-results" : ""
            } search-results`}
          >
            {results.map((result, index) => (
              <div
                key={index}
                className="search-result"
                id={result.uri}
                onMouseDown={handleClick}
              >
                <span className="result-track">{result.trackName}</span>
                <span className="result-artist">{result.artist}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
