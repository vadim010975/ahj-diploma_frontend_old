import { _URL } from "./Main";

export default class Search {
  constructor() {
    this.formEl = document.querySelector(".main__header_form");
    this.inputEl = this.formEl.querySelector(".main__header_input");
    this.onInput = this.onInput.bind(this);
    this.inputEl.addEventListener("input", this.onInput);
    this.handlerSearch = null;
  }

  onInput(e) {
    e.preventDefault();
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    const text = this.inputEl.value;
    this._timeout = setTimeout(() => this.find(text), 300);
  }

  async find(text) {
    try {
      const response = await fetch(
        _URL + `/find?text=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      this.handlerSearch(data);
    } catch (error) {
      console.log(error);
    }
  }
}
