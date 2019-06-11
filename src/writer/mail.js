import { Worker } from '@scola/worker';
import { createTransport } from 'nodemailer';
import defaults from 'lodash-es/defaultsDeep';
import each from 'async/each';
import marked from 'marked';
import merge from 'lodash-es/merge';
import sprintf from 'sprintf-js';

const woptions = {};

export default class MailWriter extends Worker {
  static getOptions() {
    return woptions;
  }

  static setOptions(options) {
    merge(woptions, options);
  }

  constructor(options = {}) {
    super(options);

    options = defaults(options, woptions);

    this._message = null;
    this._transport = null;

    this.setMessage(options.message);
    this.setTransport(options.transport);
  }

  setMessage(value = {}) {
    this._message = value;
    return this;
  }

  setTransport(value = {}) {
    this._transport = value;
    return this;
  }

  act(request, data, callback) {
    const smtp = createTransport(this._transport);
    const pass = [];
    const fail = [];

    const wrap = (data.mail.wrap || '%s').replace(/%([^s])/g, '%%$1');

    each(data.data, (datum, eachCallback) => {
      let subject = null;
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
        subject = sprintf.sprintf(data.mail.subject, datum);
        text = sprintf.sprintf(data.mail.body, datum);
        html = sprintf.sprintf(wrap, marked(text, {
          breaks: true,
          sanitize: true
        }));
      } catch (error) {
        this._error(request, data, callback, fail, datum, error);
        return eachCallback();
      }

      const message = Object.assign({
        attachments: data.mail.attachments,
        from: data.mail.from,
        to: datum.to,
        subject,
        html,
        text
      }, this._message);

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
    if (this._decide) {
      return this._decide(request, data);
    }

    return Array.isArray(data.data) &&
      typeof data.mail !== 'undefined';
  }

  _error(request, data, callback, fail, datum, error) {
    this.log('error', request, error, callback);

    datum.error = error;
    fail[fail.length] = datum;
  }
}
