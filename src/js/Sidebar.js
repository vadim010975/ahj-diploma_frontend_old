import { _URL } from "./Main";

export default class Sidebar {
  constructor() {
    this.bindToDom();
    this.activity = false;
    this.changeState = this.changeState.bind(this);
  }

  bindToDom() {
    this.element = document.querySelector(".sidebar");
    this.sidebarContentEl = this.element.querySelector(".sidebar__content");
    this.sidebarTitleEl = this.element.querySelector(".sidebar__title");
    this.imagesEl = this.element.querySelector(".count-images");
    this.imagesEl.closest("li").addEventListener("click", this.onClickImages);
    this.videosEl = this.element.querySelector(".count-videos");
    this.videosEl.closest("li").addEventListener("click", this.onClickVideos);
    this.audiosEl = this.element.querySelector(".count-audios");
    this.audiosEl.closest("li").addEventListener("click", this.onClickAudios);
    this.messagesEl = this.element.querySelector(".count-messages");
    this.messagesEl
      .closest("li")
      .addEventListener("click", this.onClickMessages);
    this.linksEl = this.element.querySelector(".count-links");
    this.linksEl.closest("li").addEventListener("click", this.onClickLinks);
    this.otherFilesEl = this.element.querySelector(".count-other-files");
    this.otherFilesEl
      .closest("li")
      .addEventListener("click", this.onClickOtherFiles);
  }

  activate() {
    this.activity = true;
    this.element.classList.add("active");
    setTimeout(() => {
      this.sidebarContentEl.classList.add("active");
      this.getInformation();
    }, 300);
  }

  deactivate() {
    this.activity = false;
    this.element.classList.remove("active");
    this.sidebarContentEl.classList.remove("active");
  }

  changeState() {
    if (this.activity) {
      this.deactivate();
      return;
    }
    this.activate();
  }

  async getInformation() {
    try {
      const response = await fetch(_URL + "/getinformation");
      const data = await response.json();
      this.renderInformation(data);
    } catch (error) {
      console.log(error);
    }
  }

  renderInformation(data) {
    console.log(data);
    this.sidebarTitleEl.textContent = "Найдено " + data.all;
    this.imagesEl.textContent = data.images;
    this.videosEl.textContent = data.videos;
    this.audiosEl.textContent = data.audios;
    this.messagesEl.textContent = data.messages;
    this.linksEl.textContent = data.links;
    this.otherFilesEl.textContent = data.otherFiles;
  }

  onClickVideos() {}

  onClickAudios() {}

  onClickImages() {}

  onClickMessages() {}

  onClickLinks() {}

  onClickOtherFiles() {}
}
