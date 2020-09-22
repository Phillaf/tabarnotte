class MidiInput extends HTMLElement {

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    this.init();
  };

  init = async () => {
    const midiAccess = await navigator.requestMIDIAccess();
    for (var input of midiAccess.inputs.values()){
        input.onmidimessage = this.dispatchMIDIMessage;
    }
  }

  dispatchMIDIMessage = (message) => {
    this.noteOff(message);
    this.noteMute(message);
    this.noteOn(message);
  }

  noteOn = (message) => {
    if (message.data[0] !== 144 || message.data[2] == 0) { return; }

    this.dispatchEvent(
      new CustomEvent("note-on", {
        detail: {
          "note": message.data[1],
          "velocity": message.data[2] 
        },
        bubbles: true,
      })
    );
  }

  noteOff = (message) => {
    if (message.data[0] !== 128) { return; }

    this.dispatchEvent(
      new CustomEvent("note-off", {
        detail: {"note": message.data[1]},
        bubbles: true,
      })
    );
  }

  noteMute = (message) => {
    if (message.data[0] !== 144 || message.data.length <= 2 || message.data[2] !== 0) { return; }

    this.dispatchEvent(
      new CustomEvent("note-off", {
        detail: {"note": message.data[1]},
        bubbles: true,
      })
    );
  }

}

customElements.define('midi-input', MidiInput);
export {MidiInput};
