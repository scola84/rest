import { Worker } from '@scola/worker';

export default class Importer extends Worker {
  constructor(options = {}) {
    super(options);

    this._map = null;
    this._name = null;
    this._object = null;

    this.setMap(options.map);
    this.setName(options.name);
    this.setObject(options.object);
  }

  setMap(value = {}) {
    this._map = value;
    return this;
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
    const fields = this._map.fields;

    let object = {};
    let name = null;
    let value = null;

    for (let i = 0; i < fields.length; i += 1) {
      name = fields[i].name;
      value = fields[i].value;
      object[name] = value(box.box, data);
    }

    object = this._map.multiple ? this._split(object) : [object];

    this.merge(box, data, object);
    this.pass(box, data, callback);
  }

  merge(box, data, object) {
    if (this._merge) {
      return this._merge(box, data, object);
    }

    data.output[this._object] = data.output[this._object] || {};
    data.output[this._object][this._name] = object;

    return data;
  }

  _split(object) {
    const keys = Object.keys(object);
    const result = [{}];

    let key = null;
    let values = null;

    for (let i = 0; i < keys.length; i += 1) {
      key = keys[i];

      values = Array.isArray(object[key]) ? object[key] :
        (typeof object[key] === 'string' ?
          object[key].split(',') : [object[key]]);

      for (let j = 0; j < values.length; j += 1) {
        result[j] = result[j] || {};
        result[j][key] = values[j];
      }
    }

    return result;
  }
}
