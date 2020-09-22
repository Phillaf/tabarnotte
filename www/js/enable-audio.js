class EnableAudio extends HTMLElement {

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(style.content.cloneNode(true));

    const caption = navigator.requestMIDIAccess ? this.createButton() : this.createUnsupported();
    this.shadow.appendChild(caption);
  };

  createUnsupported = () => {
    const browserSupport = document.createElement('p')
    browserSupport.innerHTML = 'WebMIDI is not supported in this browser.';
    return browserSupport;
  }

  createButton = () => {
    const button = document.createElement('button');
    button.innerHTML = "Enable Audio";
    button.onclick = this.enableAudio;
    return button;
  }

  enableAudio = () => {
    this.dispatchEvent(new CustomEvent("enable-audio", {bubbles: true}));
    this.shadow.innerHTML = `<p>Audio Enabled</p>`;
  }

}

const style = document.createElement('template');
style.innerHTML = `
  <style>
    button {
      border: 0;
      padding: 1em;
      text-align: center;
      background-color: #000000;
      color: #ffffff;
      display: block;
      margin: 0 auto;
    }
    button:hover{
      cursor: pointer;
      background-color: #333333;
      color: #ffffff;
    }
  </style>`;

customElements.define('enable-audio', EnableAudio);
export {EnableAudio};
