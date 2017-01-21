export default class Flash {
  constructor() {
    this.type = '';
    this.message = '';
  }

  show(type, message) {
    this.type = type;
    this.message = message;
    $(".alert").show();
  }

  hide() {
    $(".alert").hide();
    this.type = '';
    this.message = '';
  }
}
