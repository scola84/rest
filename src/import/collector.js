import { Worker } from '@scola/worker';

export default class Collector extends Worker {
  constructor(options = {}) {
    super(options);

    this._name = null;
    this._object = null;

    this.setName(options.name);
    this.setObject(options.object);
  }

  setName(value = null) {
    this._name = value;
    return this;
  }

  setObject(value = null) {
    this._object = value;
    return this;
  }

  act(box, data, callback) {
    if (box.import.load === true) {
      this._collect(box, data);
    }

    this.pass(box, box.data, callback);
  }

  err(box, error, callback) {
    box.data.output.error = true;
    box.data.output[this._object][this._name][box.begin].error = error;
    this.pass(box, box.data, callback);
  }

  _collect(box, data) {
    box.data.output[this._object][this._name][box.begin] = Object.assign({},
      data.data,
      box.data.output[this._object][this._name][box.begin]
    );
  }
}
