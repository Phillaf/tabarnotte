import SignalingServer from './signaling.js'

export default class RTCConnection {

  peerConn;
  dataChannel;
  signalingServer;

  constructor(onOpen, onClose, onMessage) {
    this.signalingServer = new SignalingServer(
      this.joinPeerConnection,
      this.initiatePeerConnection,
      this.signalingMessageCallback,
    )

    this.onOpen = onOpen;
    this.onClose = onClose;
    this.onMessage = onMessage;
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
      this.peerConn.addIceCandidate(new RTCIceCandidate({
        sdpMLindIndex: message.sdpMLindIndex,
        sdpMid: message.sdpMid,
        candidate: message.candidate,
      }));
    }
  }

  joinPeerConnection = () => {
    console.log(`Joining Peer connection`);
    this.buildPeerConnection();
    this.peerConn.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.onDataChannelCreated(this.dataChannel);
    };
  }

  initiatePeerConnection = () => {
    console.log(`Initiating Peer connection`);
    this.buildPeerConnection();
    this.dataChannel = this.peerConn.createDataChannel('jam');
    this.onDataChannelCreated(this.dataChannel);
    this.peerConn.createOffer(this.onLocalSessionCreated, this.onError);
  }

  buildPeerConnection = () => {
    this.peerConn = new RTCPeerConnection();
    this.peerConn.onicecandidate = (event) => {
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
    channel.onopen = this.onOpen;
    channel.onclose = this.onClose;
    channel.onmessage = this.onMessage;
  }

  onLocalSessionCreated = (desc) => {
    this.peerConn.setLocalDescription(desc, () => {
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
    this.dataChannel.send(message);
  }
}
