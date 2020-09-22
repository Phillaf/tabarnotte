import RTCConnection from './rtc.js';

class DataChannel {

  constructor() {
    this.rtc = new RTCConnection(
      this.onOpen,
      this.onClose,
      this.onMessage
    );
  }

  onOpen = () => {
    console.log('Channel opened!');
    window.addEventListener("note-on", this.sendNoteOn, false);
    window.addEventListener("note-off", this.sendNoteOff, false);
  };

  onClose = () => {
    console.log('channel closed');
  };

  onMessage = (event) => {
    let eventName = `rtc-` + JSON.parse(event.data)["eventName"];
    let newEvent = new CustomEvent(eventName, {
      detail: JSON.parse(event.data),
      bubbles: true,
    })
    window.dispatchEvent(newEvent);
  }

  sendNoteOn = (event) => {
    this.rtc.sendMessage(JSON.stringify({
      eventName: "note-on",
      note: event.detail.note,
      velocity: event.detail.velocity,
    }));
  }

  sendNoteOff = (event) => {
    this.rtc.sendMessage(JSON.stringify({
      eventName: "note-off",
      note: event.detail.note,
    }));
  }

}

let conn = new DataChannel();
