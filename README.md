# deciball
Microphone audio visualiser with Spotify integration written in React and Node.js
- Spotify integration - the permissions required allow the app to search for and play tracks
- Custom built scrubber - no third-party libraries used
- Custom built audio visualiser written in native JavaScript using HTML Canvas - no third-party libraries used

### NOTE: The app probably wont work as intended anymore on most devices
This app relies on microphone audio hence the permission request - it's currently impossible to get real-time Spotify track frequency data and impossible for the browser to tap into system output audio so this was the compromise. Because of this, the app probably won't work as intended on most devices due to output sound being digitally cancelled out in the microphone input. `You'll most likely need to play the music from a different device's speakers to see the pretty ball dance as intended. This kind of ruined the premise of the app...`
