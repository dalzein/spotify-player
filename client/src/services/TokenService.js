export function getCookieValue(key) {
  const cookies = document.cookie.split("; ");
  for (var i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].split("=");
    let name = cookie[0];
    let value = cookie[1];
    if (name === key) {
      return value;
    }
  }
  return "";
}

export async function getToken() {
  const token = getCookieValue("spotifyToken");
  if (token) return token;

  const refreshToken = getCookieValue("spotifyRefreshToken");
  if (!refreshToken) return null;

  return fetch(`/api/refreshToken?refresh_token=${refreshToken}`).then(() => {
    const newToken = getCookieValue("spotifyToken");
    if (!newToken) window.location.reload();
    return newToken;
  });
}
