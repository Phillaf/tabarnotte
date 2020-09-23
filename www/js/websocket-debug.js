
var content = document.getElementById('content');
var socket = new WebSocket('ws://localhost:8080');

var isInitiator;

socket.onopen = function () {
  socket.send('init');
};

socket.onmessage = function (message) {

  switch (message.data) {
    case 'created':
      console.log('I created the room');
      isInitiator = true;
      break;
    case 'joined':
      isInitiator = false;
      createPeerConnection(isInitiator);
      console.log('I joined the room');
      break;
    case 'ready':
      createPeerConnection(isInitiator);
      break;
    default:
      console.log(`message: ${message.data}`);
      signalingMessageCallback(message)
      break;
  }

};

socket.onerror = function (error) {
  console.log('WebSocket error: ' + error);
};

var peerConn;
var dataChannel;

signalingMessageCallback = (message) => {
  console.log(message);
  if (message.type === 'offer') {
    console.log('Got offer. Sending answer to peer.');
    peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},
                                  logError);
    peerConn.createAnswer(onLocalSessionCreated, logError);

  } else if (message.type === 'answer') {
    console.log('Got answer.');
    peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},
                                  logError);

  } else if (message.type === 'candidate') {
    peerConn.addIceCandidate(new RTCIceCandidate({
      candidate: message.candidate
    }));

  }
}

createPeerConnection = (isInitiator) => {
  console.log(`Creating Peer connection as initiator? ${isInitiator}`);
  peerConn = new RTCPeerConnection();
  peerConn.onicecandidate = (event) => {
    console.log(`icecandidate event: ${event}`);
    console.log(event);
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLindIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    } else {
      console.log('end of candidates');
    }
  }

  if (isInitiator) {
    console.log('Creating Data Channel');
    console.log(peerConn);
    dataChannel = peerConn.createDataChannel('jam');
    onDataChannelCreated(dataChannel);

    console.log('Creating an offer');
    peerConn.createOffer(onLocalSessionCreated, logError);
  } else {
    peerConn.ondatachannel = (event) => {
      console.log(`ondatachannel:`, event.channel);
      dataChannel = event.channel;
      onDataChannelCreated(dataChannel);
    };
  }
}

onDataChannelCreated = (channel) => {
  console.log(`onDataChannelCreated: ${channel}`);

  channel.onopen = () => {
    console.log('Channel opened!');
  };

  channel.onclose = () => {
    console.log('channel closed');
  };
}

onLocalSessionCreated = (desc) => {

  console.log(`local session created: ${desc}`)
  peerConn.setLocalDescription(desc, () => {
    console.log(`sending local desc: ${peerConn.localDescription}`)
    sendMessage(peerConn.localDescription);
  }, logError);
}

function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.send(message);
}

logError = (err) => {
  if (!err) return;
  if (typeof err === 'string') {
    console.warn(err);
  } else {
    console.warn(err.toString(), err);
  }
}