import { Worker } from '@scola/worker';
import messagebird from 'messagebird';
import each from 'async/each';
import sprintf from 'sprintf-js';

export default class SmsWriter extends Worker {
  constructor(options = {}) {
    super(options);

    this._config = null;
    this.setConfig(options.config);
  }

  setConfig(value = {}) {
    this._config = value;
    return this;
  }

  act(request, data, callback) {
    const transport = messagebird(this._config.transport.key);
    const pass = [];
    const fail = [];

    each(data.data, (datum, eachCallback) => {
      const body = sprintf.sprintf(data.sms.body, datum);

      const message = {
        originator: data.sms.from,
        recipients: [
          datum.to
        ],
        body
      };

      transport.messages.create(message, (error) => {
        if (error) {
          this.log('error', request, error, callback);
          datum.error = error;
          fail[fail.length] = datum;
        } else {
          pass[pass.length] = datum;
        }

        eachCallback();
      });
    }, () => {
      this.pass(request, { fail, pass }, callback);
    });
  }

  decide(request, data) {
    return Array.isArray(data.data) &&
      typeof data.sms !== 'undefined';
  }
}
