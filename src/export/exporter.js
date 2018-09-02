import { Worker } from '@scola/worker';
import merge from 'lodash-es/merge';
import set from 'lodash-es/set';

export default class Exporter extends Worker {
  constructor(options = {}) {
    super(options);

    this._map = null;
    this._name = null;

    this.setMap(options.map);
    this.setName(options.name);
  }

  setMap(value = {}) {
    this._map = value;
    return this;
  }

  setName(value = null) {
    this._name = value;
    return this;
  }

  act(box, data, callback) {
    const fields = this._map.fields;
    const object = {};

    let name = null;
    let value = null;

    for (let i = 0; i < fields.length; i += 1) {
      name = fields[i].name;
      value = fields[i].value;

      try {
        set(object, name, value(box, data));
      } catch (error) {
        data.input.error = true;
        data.input.object = {
          object: [{ error: `500 Value is invalid (${error.message})` }]
        };
      }
    }

    this.merge(box, data, object);
    this.pass(box, data, callback);
  }

  merge(box, data, object) {
    data.output = merge(data.output, object);
    return data;
  }
}
