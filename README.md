# Tabarnotte

Experiment in trying to play real-time music with someone over the network.

*What is done*  
- Browser getting midi signal from the instrument
- Playing the midi notes locally via a simple oscilliator
- Establishing a RTC connection between 2 browsers
- Playing notes over the peer-to-peer connection into the other browser's oscilliator

*What is not done*  
- Handling more than 2 person at the time
- Optimizing events and data for faster transfer and decoding
- Setting up the signaling server and website on a publicly reacheable place.
- Choosing midi output
- This hasn't been tested in a browser other than chrome 85.

*How to run*  
- install npm dependencies `docker-compose run npm install`
- run the web server and the websocket server`docker-compose up -d`
- open 2 browser tabs in the same console, and verify that you get the `Channel opened!` message
- Chrome asks for a user interaction before it allows to play sounds. Make sure to click the "Enable Audio" button to hear the synth.

*To run on a network*  
- Change the websocket server address in `www/js/signaling.js`
- In chrome, midi is blocked by default on websites that don't have an https connection. You can workaround this using the flag `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.


The local midi+oscilliator part can be tried online here (no RTC setup yet).
https://tabarnotte.com
