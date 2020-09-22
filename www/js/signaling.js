export default class SignalingServer {

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
    this.socket.send(JSON.stringify(message));
  }
}
