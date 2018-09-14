import { Worker } from '@scola/worker';
import { createTransport } from 'nodemailer';
import each from 'async/each';
import marked from 'marked';
import sprintf from 'sprintf-js';

export default class MailWriter extends Worker {
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
    const smtp = createTransport(this._config.transport);
    const pass = [];
    const fail = [];

    const body = data.mail.body;
    const wrap = (data.mail.wrap || '%s').replace(/%([^s])/g, '%%$1');

    each(data.data, (datum, eachCallback) => {
      let text = null;
      let html = null;

      if (typeof data.mail.from === 'undefined') {
        const error = new Error('Mail is invalid: from not set');
        this._error(request, data, callback, fail, datum, error);
        return eachCallback();
      }

      if (typeof datum.to === 'undefined') {
        const error = new Error('Mail is invalid: to not set');
        this._error(request, data, callback, fail, datum, error);
        return eachCallback();
      }

      try {
        text = sprintf.sprintf(body, datum);
        html = sprintf.sprintf(wrap, marked(text, {
          breaks: true,
          sanitize: true
        }));
      } catch (error) {
        this._error(request, data, callback, fail, datum, error);
        return eachCallback();
      }

      const message = Object.assign({
        from: data.mail.from,
        to: datum.to,
        subject: data.mail.subject,
        html,
        text
      }, this._config.message);

      return smtp.sendMail(message, (error, info) => {
        if (error) {
          this._error(request, data, callback, fail, datum, error);
          return eachCallback();
        }

        datum.info = info;
        pass[pass.length] = datum;

        return eachCallback();
      });
    }, () => {
      this.pass(request, { fail, pass }, callback);
    });
  }

  decide(request, data) {
    return Array.isArray(data.data) &&
      typeof data.mail !== 'undefined';
  }

  _error(request, data, callback, fail, datum, error) {
    this.log('error', request, error, callback);

    datum.error = error;
    fail[fail.length] = datum;
  }
}
