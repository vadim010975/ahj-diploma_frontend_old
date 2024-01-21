import { _URL } from "./Main";
import Modal from "./Modal";

export default class Post {
  constructor(data) {
    this.data = data;
    this.createElement();
    this.handlerClickBtnRemove = null;
  }

  createElement() {
    this.element = document.createElement("li");
    this.element.classList.add("list-item");
    this.element.dataset.id = this.data.date;
    this.element.innerHTML = `
      <div class="item-container">
        <h4 class="item-header"></h4>
        <div class="item-content">
        </div>
        <div class="item-geolocation hidden"></div>
        <div class="item-buttons">
          <div style="opacity: 0; flex-grow: 1"></div>
          <button class="item-btn-remove"></button>
        </div>
      </div>`;
    this.headerEl = this.element.querySelector(".item-header");
    this.itemContentEl = this.element.querySelector(".item-content");
    this.geolocationEl = this.element.querySelector(".item-geolocation");
    this.btnsEl = this.element.querySelector(".item-buttons");
    this.btnRemove = this.element.querySelector(".item-btn-remove");
    this.onClickBtnRemove = this.onClickBtnRemove.bind(this);
    this.btnRemove.addEventListener("click", this.onClickBtnRemove);
    this.setDate();
    this.setContent();
    this.setGeolocation();
  }

  setDate() {
    const date =
      new Date(+this.data.date).toLocaleTimeString().slice(0, -3) +
      " " +
      new Date(+this.data.date).toLocaleDateString();
    this.headerEl.textContent = date;
  }

  setContent() {
    let contentElement;
    if (this.data.type === "message" || this.data.type === "link") {
      contentElement = document.createElement("p");
      contentElement.classList.add("content-message");
      const text = this.data.message;
      if (this.data.type === "link") {
        /* eslint-disable-next-line */
        const re = /(https?|ftp):\/\/\S+[^\s.,> )\];'\"!?]/gi;
        const subst = '<a href="$&" target="_blank">$&</a>';
        const withlink = text.replaceAll(re, subst);
        contentElement.innerHTML = withlink;
      } else {
        contentElement.textContent = text;
      }
      this.itemContentEl.appendChild(contentElement);
      return;
    }
    const typeFile = this.data.mimetype.split("/")[0];
    switch (typeFile) {
      case "image":
        contentElement = document.createElement("img");
        contentElement.classList.add("content-img");
        contentElement.src = _URL + this.data.filePath;
        break;
      case "audio":
        contentElement = document.createElement("audio");
        contentElement.classList.add("content-audio");
        contentElement.controls = true;
        contentElement.src = _URL + this.data.filePath;
        break;
      case "video":
        contentElement = document.createElement("video");
        contentElement.classList.add("content-video");
        contentElement.controls = true;
        contentElement.src = _URL + this.data.filePath;
        break;
      default:
        contentElement = document.createElement("div");
        /* eslint-disable-next-line */
        contentElement.classList.add("item-file-wrapper");
        /* eslint-disable-next-line */
        const extnameEl = document.createElement("div");
        extnameEl.classList.add("item-extname");
        extnameEl.textContent = this.data.extname;
        contentElement.appendChild(extnameEl);
    }
    this.btnLoad = document.createElement("button");
    this.btnLoad.classList.add("item-btn-load");
    this.btnLoad.textContent = "Скачать файл";
    this.onClickBtnLoad = this.onClickBtnLoad.bind(this);
    this.btnLoad.addEventListener("click", this.onClickBtnLoad);
    this.btnsEl.insertAdjacentElement("afterbegin", this.btnLoad);
    this.itemContentEl.appendChild(contentElement);
    const fNameEl = document.createElement("div");
    fNameEl.classList.add("item-content-file-name");
    fNameEl.textContent = this.data.fileName;
    this.itemContentEl.appendChild(fNameEl);
  }

  setGeolocation() {
    if (this.data.geolocation) {
      this.geolocationEl.classList.remove("hidden");
      this.geolocationEl.textContent = `[${this.data.geolocation.latitude}, ${this.data.geolocation.longitude}]`;
    }
  }

  get() {
    return this.element;
  }

  async onClickBtnLoad() {
    const response = await fetch(_URL + this.data.filePath);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.download = this.data.fileName;
    link.href = window.URL.createObjectURL(blob);
    link.click();
  }

  onClickBtnRemove() {
    const modal = new Modal({
      okBtn: true,
      cancelBtn: true,
    });
    modal.setHeader("удаление поста");
    modal.setContent("Вы уверены, что хотите удалить пост?");
    modal.init((res) => {
      if (res?.okBtn) {
        this.handlerClickBtnRemove(this.data.date);
      }
      modal.remove();
    });
  }
}
