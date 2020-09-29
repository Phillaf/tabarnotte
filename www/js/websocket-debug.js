class SignalingServer {

  constructor(onJoin, onReady, onSignal){
    this.socket = new WebSocket('ws://localhost:8080');
    this.socket.onopen = this.onOpen;
    this.socket.onmessage = this.onMessage;
    this.socket.onerror = this.onError;

    this.onJoin = onJoin;
    this.onReady = onReady;
    this.onSignal = onSignal;
  }

  onOpen = () => {
    this.socket.send('init');
  };

  onMessage = (message) => {
    switch (message.data) {
      case 'created':
        this.onCreate();
        break;
      case 'joined':
        this.onJoin();
        break;
      case 'ready':
        this.onReady();
        break;
      default:
        this.onSignal(JSON.parse(message.data));
    }
  };

  onCreate = () => {
    console.log('Room created');
  }

  onError = function (error) {
    console.log('WebSocket error: ' + error);
  };

  sendMessage = (message) => {
    console.log('Client sending message: ', message);
    this.socket.send(JSON.stringify(message));
  }
}

class RTCConnection {

  peerConn;
  dataChannel;
  signalingServer;

  message;

  constructor() {
    this.signalingServer = new SignalingServer(
      this.joinPeerConnection,
      this.initiatePeerConnection,
      this.signalingMessageCallback,
    )
  }

  signalingMessageCallback = (message) => {
    if (message.type === 'offer') {
      console.log('Got offer. Sending answer to peer.');
      this.peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {}, this.onError);
      this.peerConn.createAnswer(this.onLocalSessionCreated, this.onError);

    } else if (message.type === 'answer') {
      console.log('Got answer.');
      this.peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {}, this.onError);

    } else if (message.type === 'candidate') {
      console.log('Got Ice Candidate');
      console.log(message);
      this.peerConn.addIceCandidate(new RTCIceCandidate({
        sdpMLindIndex: message.sdpMLindIndex,
        sdpMid: message.sdpMid,
        candidate: message.candidate,
      }));
    }
  }

  joinPeerConnection = () => {
    console.log(`Joining Peer connection`);
    this.message = 'joiner';
    this.buildPeerConnection();
    this.peerConn.ondatachannel = (event) => {
      console.log(`ondatachannel:`, event.channel);
      this.dataChannel = event.channel;
      this.onDataChannelCreated(this.dataChannel);
    };
  }

  initiatePeerConnection = () => {
    console.log(`Initiating Peer connection`);
    this.message = 'initiator';
    this.buildPeerConnection();
    this.dataChannel = this.peerConn.createDataChannel('jam');
    this.onDataChannelCreated(this.dataChannel);

    console.log('Creating an offer');
    this.peerConn.createOffer(this.onLocalSessionCreated, this.onError);
  }

  buildPeerConnection = () => {
    this.peerConn = new RTCPeerConnection();
    this.peerConn.onicecandidate = (event) => {
      console.log(event.candidate);
      if (event.candidate) {
        this.signalingServer.sendMessage({
          type: 'candidate',
          label: event.candidate.sdpMLindIndex,
          sdpMLindIndex: event.candidate.sdpMLindIndex,
          sdpMid: event.candidate.sdpMid,
          candidate: event.candidate.candidate
        });
      } else {
        console.log('end of candidates');
      }
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

    channel.onmessage = () => {
      console.log(event.data);
    }
  }

  onLocalSessionCreated = (desc) => {
    console.log(`local session created: ${desc}`)
    this.peerConn.setLocalDescription(desc, () => {
      console.log(`sending local desc: ${this.peerConn.localDescription}`)
      this.signalingServer.sendMessage(this.peerConn.localDescription);
    }, this.onError);
  }

  onError = (err) => {
    if (!err) return;
    if (typeof err === 'string') {
      console.warn(err);
    } else {
      console.warn(err.toString(), err);
    }
  }

  sendMessage = (message) => {
    this.dataChannel.send(this.message);
  }
}

conn = new RTCConnection();

setInterval(() => {conn.sendMessage()}, 5000)
