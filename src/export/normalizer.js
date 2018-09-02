import { Worker } from '@scola/worker';

export default class Normalizer extends Worker {
  act(box, data, callback) {
    data.input = this._normalize(data.input);
    this.pass(box, data, callback);
  }

  _normalize(input) {
    const names = Object.keys(input);
    const normalized = {};

    let name = null;
    let sub = null;

    for (let i = 0; i < names.length; i += 1) {
      [name, sub] = names[i].split('_');
      sub = sub || name;

      normalized[name] = normalized[name] || {};
      normalized[name][sub] = this._split(input[names[i]]);
    }

    return normalized;
  }

  _split(object) {
    const normalized = [];
    const names = Object.keys(object);

    let name = null;
    let values = null;

    for (let i = 0; i < names.length; i += 1) {
      name = names[i];

      values = typeof object[name] === 'string' ?
        object[name].split(',') : [object[name]];

      for (let j = 0; j < values.length; j += 1) {
        normalized[j] = normalized[j] || {};
        normalized[j][name] = values[j];
      }
    }

    return normalized;
  }
}
