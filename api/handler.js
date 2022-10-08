"use strict";
const axios = require("axios");

module.exports.login = async () => {
  const scope =
    "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private user-library-read";
  return {
    statusCode: 200,
    body: JSON.stringify({
      url: `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=${scope}&show_dialog=true`,
    }),
  };
};

module.exports.redirect = async (event) => {
  const code = event.queryStringParameters?.code ?? null;

  const formData = new URLSearchParams();

  formData.set("grant_type", "authorization_code");
  formData.set("code", code);
  formData.set("redirect_uri", process.env.REDIRECT_URI);
  formData.set("client_id", process.env.CLIENT_ID);
  formData.set("client_secret", process.env.CLIENT_SECRET);

  if (!code) {
    return {
      statusCode: 301,
      headers: {
        location: "https://deciball.io",
      },
    };
  } else {
    const response = await axios({
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      data: formData.toString(),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    })
      .then((response) => response)
      .catch((error) => error);

    if (response.data?.access_token) {
      return {
        statusCode: 301,
        cookies: [
          `spotifyToken=${response.data.access_token}; expires=${new Date(
            Date.now() + response.data.expires_in * 1000
          ).toUTCString()}; path=/`,
          `spotifyRefreshToken=${response.data.refresh_token}; path=/`,
        ],
        headers: {
          location: "https://deciball.io",
          "Access-Control-Allow-Credentials": true,
        },
      };
    }

    return {
      statusCode: 301,
      headers: { location: "https://deciball.io" },
    };
  }
};

module.exports.refreshToken = async (event) => {
  const formData = new URLSearchParams();

  formData.set("grant_type", "refresh_token");
  formData.set("refresh_token", event.queryStringParameters.refresh_token);
  formData.set("client_id", process.env.CLIENT_ID);
  formData.set("client_secret", process.env.CLIENT_SECRET);

  const response = await axios({
    method: "POST",
    url: "https://accounts.spotify.com/api/token",
    data: formData.toString(),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => response)
    .catch((error) => error);

  if (response.data?.access_token) {
    return {
      statusCode: 200,
      cookies: [
        `spotifyToken=${response.data.access_token}; expires=${new Date(
          Date.now() + response.data.expires_in * 1000
        ).toUTCString()}; path=/`,
      ],
      headers: {
        "Access-Control-Allow-Credentials": true,
      },
    };
  } else {
    return {
      statusCode: 200,
      cookies: [
        `spotifyToken=null; expires=${new Date(0).toUTCString()}; path=/`,
        `spotifyRefreshToken=null; expires=${new Date(
          0
        ).toUTCString()}; path=/`,
      ],
      headers: {
        "Access-Control-Allow-Credentials": true,
      },
    };
  }
};

module.exports.logout = async () => {
  return {
    statusCode: 200,
    cookies: [
      `spotifyToken=null; expires=${new Date(0).toUTCString()}; path=/`,
      `spotifyRefreshToken=null; expires=${new Date(0).toUTCString()}; path=/`,
    ],
    headers: {
      "Access-Control-Allow-Credentials": true,
    },
  };
};
