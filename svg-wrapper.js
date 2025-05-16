import styles from '../styles/style.css?inline';
import defaultStyles from './styles/svg-wrapper.css?inline';

const template = document.createElement('template');

template.innerHTML = /*html*/`
<style>
  ${ styles }
  ${ defaultStyles }
</style>

<div id="svg-container" class="flex-column"></div>
`;

class Component extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this.$svgContainer = this._shadow.querySelector("div");
    this.$svg;
    this.$path;
  }

  static get observedAttributes() { return ['background', 'colour', 'label', 'image', 'pointer', 'custom-styles']; }

  get background() { return this.getAttribute('background'); }
  get colour() { return this.getAttribute('colour'); }
  get customStyles() { return this.getAttribute('custom-styles'); }
  get image() { return this.getAttribute('image'); }
  get label() { return this.getAttribute('label'); }
  get pointer() { return JSON.parse(this.getAttribute('pointer')); }

  set background(value) { this.setAttribute('background', value); }
  set colour(value) { this.setAttribute('colour', value); }
  set customStyles(value) { this.setAttribute('custom-styles', value); }
  set image(value) { this.setAttribute('image', value); }
  set label(value) { this.setAttribute('label', value); }
  set pointer(value) { this.setAttribute('pointer', value); }

  // A web component implements the following lifecycle methods.
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal == newVal) return;
    switch (name) {
      case 'custom-styles':
        this._loadCustomStyleSheet();
        break;
      case "image":
        this.createSvg();
        break;
      case "label":
        this.$svgContainer.setAttribute("title", this.label);
        this.setAlt();
        break;
      case "colour":
        this.setColour();
        break;
      case "background":
        this.setBackground();
        break;
      case "pointer":
        this.setPointer();
        break;
    }
  }
  connectedCallback() {
    // Triggered when the component is added to the DOM.
  }
  disconnectedCallback() {
    // Triggered when the component is removed from the DOM.
    // Ideal place for cleanup code.
    // Note that when destroying a component, it is good to also release any listeners.
  }
  adoptedCallback() {
    // Triggered when the element is adopted through `document.adoptElement()` (like when using an <iframe/>).
    // Note that adoption does not trigger the constructor again.
  }
  _loadCustomStyleSheet() {
    if (!this.customStyles) return;

    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('href', this.customStyles);

    this._shadow.appendChild(linkElement);
  }

  async createSvg() {
    try {
      let svg = await import(`../assets/ui/${ this.image }.svg?raw`);
      this.$svgContainer.innerHTML = svg.default;
      this.$svg = this._shadow.querySelector("svg");
      this.$svg.removeAttribute("height");
      this.$svg.removeAttribute("width");
      this.$svg.removeAttribute("fill");
      this.$path = this._shadow.querySelector("path");
      this.setAlt();
      this.setColour();
      this.setBackground();
      this.setPointer();
    }
    catch (err) { }
  }

  setAlt() {
    if (this.$svg && this.label) {
      this.$svg.setAttribute("alt", this.label);
    }
  }

  setBackground() {
    if (this.$svgContainer && this.background) {
      this.$svgContainer.style.backgroundColor = this.background;
    }
  }

  setColour() {
    if (this.$svg && this.colour) {
      this.$svg.setAttribute("fill", this.colour);
    }
  }

  setPointer() {
    if (this.$svg && this.pointer != null && this.pointer != undefined) {
      this.$svg.classList.toggle("pointer", this.pointer);
      this.$path.classList.toggle("pointer", this.pointer);
    }
  }
}

window.customElements.define('svg-wrapper', Component);