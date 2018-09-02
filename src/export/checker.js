import { Worker } from '@scola/worker';

export default class Checker extends Worker {
  act(box, data, callback) {
    const result = this._check(data.input);

    if (result === false) {
      data.input.error = true;
    }

    this.pass(box, data, callback);
  }

  _check(object) {
    const names = Object.keys(object);

    let name = null;
    let result = true;

    for (let i = 0; i < names.length; i += 1) {
      name = names[i];

      if (object[name] === null) {
        object.error = { message: 'Input is invalid', field: { name } };
        result = false;
      } else if (typeof object[name] === 'object') {
        result = this._check(object[name]) && result === true;
      }
    }

    return result;
  }
}
