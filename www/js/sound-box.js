class SoundBox extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.oscilliators = [];
    window.addEventListener("enable-audio", this.init, false);
  };

  init = () => {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    window.addEventListener("note-on", this.noteOn, false);
    window.addEventListener("note-off", this.noteOff, false);
    window.addEventListener("rtc-note-on", this.noteOn, false);
    window.addEventListener("rtc-note-off", this.noteOff, false);
  }

  noteOn = (event) => {
    const osc = this.audioContext.createOscillator();
    const note = event.detail.note;
    this.oscilliators[note] = osc;

    osc.frequency.value = Math.pow(2, (note - 69) / 12) * 440;
    osc.connect(this.audioContext.destination);
    osc.start();
  }

  noteOff = (event) => {
    this.oscilliators[event.detail.note].stop();
    this.oscilliators[event.detail.note] = null;
  }
}

customElements.define('sound-box', SoundBox);
export {SoundBox};
