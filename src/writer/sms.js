import { Worker } from '@scola/worker';
import defaults from 'lodash-es/defaultsDeep';
import messagebird from 'messagebird';
import each from 'async/each';
import merge from 'lodash-es/merge';
import sprintf from 'sprintf-js';

const woptions = {};

export default class SmsWriter extends Worker {
  static setOptions(options) {
    merge(woptions, options);
  }

  constructor(options = {}) {
    super(options);

    options = defaults(options, woptions);

    this._transport = null;
    this.setTransport(options.transport);
  }

  setTransport(value = {}) {
    this._transport = value;
    return this;
  }

  act(request, data, callback) {
    const transport = messagebird(this._transport.key);
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
