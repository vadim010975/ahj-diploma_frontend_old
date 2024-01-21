import { _URL } from "./Main";
import AudioRecoder from "./AudioRecoder";
import VideoRecoder from "./VideoRecoder";
import Modal from "./Modal";
import Geolocation from "./Geolocation";

export default class Sending {
  constructor() {
    this.bindToDom();
    this.processResponse = null;
    this.audioRecoder = new AudioRecoder(this.createAudio.bind(this));
    this.audioRecoder.handlerClickBtnCancel =
      this.hideRecordControlsEl.bind(this);
    this.videoRecoder = new VideoRecoder(this.createVideo.bind(this));
    this.videoRecoder.handlerClickBtnCancel =
      this.hideRecordControlsEl.bind(this);
    this.geolocation = new Geolocation();
    this.getState();
  }

  bindToDom() {
    this.mainEl = document.querySelector(".main");
    this.mainEl.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    this.onDropMain = this.onDropMain.bind(this);
    this.mainEl.addEventListener("drop", this.onDropMain);
    this.formEl = document.querySelector(".main__footer_form");
    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.formEl.addEventListener("submit", this.onSubmitForm);
    this.formInputEl = document.querySelector(".main__footer_input");
    this.onInput = this.onInput.bind(this);
    this.formInputEl.addEventListener("input", this.onInput);
    this.btnFileSelectEl = document.querySelector(".btn-file");
    this.onClickBtnFileSelect = this.onClickBtnFileSelect.bind(this);
    this.btnFileSelectEl.addEventListener("click", this.onClickBtnFileSelect);
    this.inputFileEl = document.querySelector(".main__footer_input_file");
    this.onChangeInputFile = this.onChangeInputFile.bind(this);
    this.inputFileEl.addEventListener("change", this.onChangeInputFile);
    this.btnAudioEl = document.querySelector(".btn-audio");
    this.onClickBtnAudio = this.onClickBtnAudio.bind(this);
    this.btnAudioEl.addEventListener("click", this.onClickBtnAudio);
    this.btnVideoEl = document.querySelector(".btn-video");
    this.onClickBtnVideo = this.onClickBtnVideo.bind(this);
    this.btnVideoEl.addEventListener("click", this.onClickBtnVideo);
    this.inputControlsEl = document.querySelector(
      ".main__footer_input_controls"
    );
    this.recordControlsEl = document.querySelector(".main__record-controls");
    this.locationIconEl = document.querySelector(".header__location_icon");
    this.onClickLocationIcon = this.onClickLocationIcon.bind(this);
    this.locationIconEl.addEventListener("click", this.onClickLocationIcon);
  }

  onClickLocationIcon() {
    this.geolocationState = !this.geolocationState;
    if (this.geolocationState) {
      this.renderlocationIcon();
    } else {
      this.hidelocationIcon();
    }
    const modalMessage = new Modal({
      okBtn: true,
    });
    modalMessage.setHeader("геоданные");
    if (this.geolocationState) {
      modalMessage.setContent("Геолокация браузера будет сохраняться");
    } else {
      modalMessage.setContent("Геолокация браузера не будет сохраняться");
    }
    modalMessage.init(() => {
      modalMessage.remove();
    });
    this.setState();
  }

  renderlocationIcon() {
    this.locationIconEl.classList.add("active");
  }

  hidelocationIcon() {
    this.locationIconEl.classList.remove("active");
  }

  getState() {
    if (localStorage.getItem("chaosOrganizer")) {
      this.geolocationState = JSON.parse(
        localStorage.getItem("chaosOrganizer")
      ).geolocationState;
    } else {
      this.geolocationState = false;
    }
    if (this.geolocationState) {
      this.renderlocationIcon();
    } else {
      this.hidelocationIcon();
    }
  }

  setState() {
    localStorage.setItem(
      "chaosOrganizer",
      JSON.stringify({
        geolocationState: this.geolocationState,
      })
    );
  }

  onDropMain(e) {
    e.preventDefault();
    this.inputFileEl.files = e.dataTransfer.files && e.dataTransfer.files;
    this.inputFileEl.dispatchEvent(new Event("change"));
  }

  onClickBtnFileSelect() {
    this.inputFileEl.dispatchEvent(new MouseEvent("click"));
  }

  async onChangeInputFile() {
    const file = this.inputFileEl.files && this.inputFileEl.files[0];
    if (!file) return;
    try {
      const formData = new FormData(this.formEl);
      if (this.geolocationState) {
        const geolocation = await this.geolocation.getCoord();
        console.log(geolocation);
        formData.set("geolocation", JSON.stringify(geolocation));
      }
      const response = await fetch(_URL + "/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      this.processResponse(data);
      this.formEl.reset();
    } catch (error) {
      this.formEl.reset();
      console.log(error);
    }
  }

  async onSubmitForm(e) {
    e.preventDefault();
    if (!this.formInputEl.value.trim()) {
      this.formInputEl.value = "";
      return;
    }
    try {
      let address;
      if (
        this.formInputEl.value.search(
          /* eslint-disable-next-line */
          /(https?|ftp):\/\/\S+[^\s.,> )\];'\"!?]/gi
        ) !== -1
      ) {
        address = "/link";
      } else {
        address = "/message";
      }
      const formData = new FormData(this.formEl);

      if (this.geolocationState) {
        const geolocation = await this.geolocation.getCoord();
        formData.set("geolocation", JSON.stringify(geolocation));
      }
      const response = await fetch(_URL + address, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      this.processResponse(data);
      this.formEl.reset();
    } catch (error) {
      this.formEl.reset();
      console.log(error);
    }
    this.activateFileSelect();
  }

  onInput() {
    if (this.formInputEl.value) {
      this.deactivateFileSelect();
      return;
    }
    this.activateFileSelect();
  }

  activateFileSelect() {
    this.btnFileSelectEl.classList.add("active");
    this.btnFileSelectEl.addEventListener("click", this.onClickBtnFileSelect);
  }

  deactivateFileSelect() {
    this.btnFileSelectEl.classList.remove("active");
    this.btnFileSelectEl.removeEventListener(
      "click",
      this.onClickBtnFileSelect
    );
  }

  createAudio(blob) {
    this.hideRecordControlsEl();
    if (blob === null) {
      const warningModal = new Modal({
        closeBtn: true,
      });
      warningModal.setHeader("предупреждение");
      warningModal.setContent(
        "Отсутсвует разрешение на использование микрофона."
      );
      warningModal.init(() => warningModal.remove());
      return;
    }
    let fileName = "My_audio.wav";
    const modal = new Modal({
      closeBtn: true,
      input: true,
      okBtn: true,
    });
    modal.setHeader("название аудио");
    modal.setContent("Введите название записанному аудио.");
    modal.init((res) => {
      if (res?.input) {
        fileName = res.input + ".wav";
      }
      modal.remove();
      const file = new File([blob], fileName);
      this.createMedia(file);
    });
  }

  createVideo(blob) {
    this.hideRecordControlsEl();
    if (blob === null) {
      const warningModal = new Modal({
        closeBtn: true,
      });
      warningModal.setHeader("предупреждение");
      warningModal.setContent(
        "Отсутсвует разрешение на использование веб-камеры."
      );
      warningModal.init(() => {
        warningModal.remove();
        this.videoRecoder.hideModalVideoEl();
      });
      return;
    }
    let fileName = "My_video.webm";
    const modal = new Modal({
      closeBtn: true,
      input: true,
      okBtn: true,
    });
    modal.setHeader("название видео");
    modal.setContent("Введите название записанному видео.");
    modal.init((res) => {
      if (res?.input) {
        fileName = res.input + ".webm";
      }
      modal.remove();
      const file = new File([blob], fileName);
      this.createMedia(file);
    });
  }

  createMedia(file) {
    // создадим fileList
    const dt = new DataTransfer();
    dt.items.add(file);
    const fileList = dt.files;
    this.inputFileEl.files = fileList;
    this.inputFileEl.dispatchEvent(new Event("change"));
  }

  renderRecordControlsEl() {
    this.inputControlsEl.classList.add("hidden");
    this.recordControlsEl.classList.remove("hidden");
  }

  hideRecordControlsEl() {
    this.recordControlsEl.classList.add("hidden");
    this.inputControlsEl.classList.remove("hidden");
  }

  onClickBtnAudio() {
    this.renderRecordControlsEl(true);
    this.audioRecoder.init();
  }

  onClickBtnVideo() {
    this.renderRecordControlsEl(false);
    this.videoRecoder.init();
  }

  async getGeolocation() {
    const geolocation = await this.geolocation.getCoord();
    return geolocation;
  }
}
