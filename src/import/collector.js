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
    const object = box.data.output[this._object][this._name];

    object[box.begin] = Object.assign({},
      object[box.begin],
      data.data
    );

    this.pass(box, box.data, callback);
  }

  err(box, error, callback) {
    const object = box.data.output[this._object][this._name];

    object[box.begin].error = {
      message: error.message,
      field: error.field,
      reason: error.reason
    };

    box.data.output.error = true;

    this.pass(box, box.data, callback);
  }
}
