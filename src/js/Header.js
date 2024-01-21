export default class Header {
  constructor() {
    this.bindToDom();
    this.activityInputEl = false;
    this.handlerClickBtnSidebar = null;
    this.handlerHideInput = null;
  }

  bindToDom() {
    const element = document.querySelector(".main__header");
    this.inputEl = element.querySelector(".main__header_input");
    this.btnSearchEl = element.querySelector(".btn_search");
    this.onClickBtnSearch = this.onClickBtnSearch.bind(this);
    this.btnSearchEl.addEventListener("click", this.onClickBtnSearch);
    this.onClickBtnSidebar = this.onClickBtnSidebar.bind(this);
    this.btnSidebarEl = element.querySelector(".btn_sidebar");
    this.btnSidebarEl.addEventListener("click", this.onClickBtnSidebar);
    this.btnInputClose = element.querySelector(".header__btn_input_close");
    this.onClickBtnInputClose = this.onClickBtnInputClose.bind(this);
    this.btnInputClose.addEventListener("click", this.onClickBtnInputClose);
  }

  onClickBtnSearch() {
    this.activityInputEl = !this.activityInputEl;
    if (this.activityInputEl) {
      this.renderInputEl();
      return;
    }
    this.hideInputEl();
  }

  onClickBtnInputClose() {
    this.activityInputEl = false;
    this.hideInputEl();
  }

  onClickBtnSidebar() {
    this.handlerClickBtnSidebar();
  }

  renderInputEl() {
    this.inputEl.classList.add("active");
  }

  hideInputEl() {
    this.inputEl.value = "";
    this.inputEl.classList.remove("active");
    this.handlerHideInput();
  }
}
