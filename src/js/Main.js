export const _URL = "http://localhost:7070";
import Post from "./Post";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Sending from "./Sending";
import Search from "./Search";

export default class Main {
  constructor(container) {
    this.containerEl = container;
    this.header = new Header();
    this.header.handlerHideInput = this.checkSearchMode.bind(this);
    this.sidebar = new Sidebar();
    this.header.handlerClickBtnSidebar = this.sidebar.changeState;
    this.sending = new Sending();
    this.sending.processResponse = this.createPost.bind(this);
    this.lastPostDate = null;
    this.searchMode = false;
    this.search = new Search();
    this.search.handlerSearch = this.showFoundMessages.bind(this);
  }

  init() {
    this.bindToDOM();
    this.loadHistory();
  }

  bindToDOM() {
    this.listItemsEl = this.containerEl.querySelector(".main__list-items");
    this.onScrollListItems = this.onScrollListItems.bind(this);
    this.listItemsEl.addEventListener("scroll", this.onScrollListItems);
  }

  onScrollListItems() {
    if (this.lastPostDate === "end" || this.searchMode) {
      return;
    }
    const position = this.listItemsEl.scrollTop;
    const clientHeight = this.listItemsEl.clientHeight;
    const scrollHeight = this.listItemsEl.scrollHeight;
    if (position === scrollHeight - clientHeight) {
      this.loadHistory(this.lastPostDate);
    }
  }

  addPostUp(postEl) {
    this.listItemsEl.insertAdjacentElement("afterbegin", postEl);
    postEl.scrollIntoView(true);
  }

  addPostDown(postEl) {
    this.listItemsEl.insertAdjacentElement("beforeend", postEl);
  }

  createPost(data, place) {
    const post = new Post(data);
    post.handlerClickBtnRemove = this.removePost.bind(this);
    if (place === "down") {
      this.addPostDown(post.get());
      return;
    }
    this.addPostUp(post.get());
  }

  async loadHistory(postDate) {
    try {
      let response;
      if (postDate) {
        response = await fetch(_URL + `/loadHistory/next/`, {
          method: "POST",
          body: postDate,
        });
      } else {
        response = await fetch(_URL + "/loadHistory");
      }
      const history = await response.json();
      if (history.type !== "history") {
        return;
      }
      if (history.data.length === 10) {
        this.lastPostDate = history.data[9].date;
      } else {
        this.lastPostDate = "end";
      }
      this.renderPosts(history);
    } catch (error) {
      console.log(error);
    }
  }

  renderPosts(posts) {
    for (let i = 0; i < posts.data.length; i += 1) {
      this.createPost(posts.data[i], "down");
    }
  }

  removeElementHistory(date) {
    const element = this.containerEl.querySelector(`[data-id="${date}"]`);
    element.remove();

    const clientHeight = this.listItemsEl.clientHeight;
    const scrollHeight = this.listItemsEl.scrollHeight;
    if (this.lastPostDate !== "end" && clientHeight === scrollHeight) {
      this.loadHistory(this.lastPostDate);
    }
  }

  async removePost(date) {
    const response = await fetch(_URL + "/remove", {
      method: "POST",
      body: date,
    });
    const data = await response.text();
    if (data) {
      console.log(data);
      this.removeElementHistory(data);
    }
  }

  hide() {
    console.log(this.listItemsEl.children);
    [...this.listItemsEl.children].forEach((el) => el.remove());
  }

  showFoundMessages(data) {
    this.hide();
    this.renderPosts(data);
    this.searchMode = true;
  }

  checkSearchMode() {
    if (this.searchMode) {
      this.hide();
      this.loadHistory();
      this.searchMode = false;
    }
  }
}
