import { Worker } from '@scola/worker';

export default class Collector extends Worker {
  constructor(options = {}) {
    super(options);

    this._name = null;
    this._sub = null;

    this.setName(options.name);
    this.setSub(options.sub);
  }

  setName(value = null) {
    this._name = value;
    return this;
  }

  setSub(value = null) {
    this._sub = value;
    return this;
  }

  act(box, data, callback) {
    if (box.box.box.load === true) {
      this._collect(box, data);
    }

    this.pass(box, box.data, callback);
  }

  err(box, error, callback) {
    box.data.output.error = true;
    box.data.output[this._name][this._sub][box.begin].error = error;
    this.pass(box, box.data, callback);
  }

  _collect(box, data) {
    if (data.data && data.data.id) {
      box.data.output[this._name][this._sub][box.begin].id = data.data.id;
    }
  }
}
