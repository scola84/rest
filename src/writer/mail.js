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

    each(data.data, (datum, eachCallback) => {
      const text = sprintf.sprintf(data.mail.body, datum);
      const html = sprintf.sprintf(data.mail.wrap || '%s', marked(text));

      const message = Object.assign({
        from: data.mail.from,
        to: datum.to,
        subject: data.mail.subject,
        html,
        text
      }, this._config.message);

      smtp.sendMail(message, (error) => {
        if (error) {
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
      typeof data.mail !== 'undefined';
  }
}
