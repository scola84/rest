import { Worker } from '@scola/worker';
import defaults from 'lodash-es/defaultsDeep';
import each from 'async/each';
import merge from 'lodash-es/merge';
import { createReadStream, createWriteStream } from 'fs';
import { ensureDirSync } from 'fs-extra';
import sharp from 'sharp';
import shortid from 'shortid';

const woptions = {
  base: null,
  path: null,
  postfix: null,
  resize: null
};

export default class FileWriter extends Worker {
  static setOptions(options) {
    merge(woptions, options);
  }

  constructor(options = {}) {
    super(options);

    options = defaults(options, woptions);

    this._base = null;
    this._path = null;
    this._postfix = null;
    this._resize = null;

    this.setBase(options.base);
    this.setPath(options.path);
    this.setPostfix(options.postfix);
    this.setResize(options.resize);
  }

  setBase(value = '/tmp/') {
    this._base = value;
    return this;
  }

  setPath(value = 'scola/') {
    this._path = value;
    ensureDirSync(this._base + '/' + this._path);

    return this;
  }

  setPostfix(value = 'original') {
    this._postfix = value;
    return this;
  }

  setResize(value = []) {
    this._resize = value;
    return this;
  }

  act(request, data, callback) {
    const input = this.filter(request, data);
    const date = Date.now();
    const files = [];

    for (let i = 0; i < input.length; i += 1) {
      input[i].date = date;
      input[i].path = this._base + '/' + this._path +
        date + '-' + shortid.generate();

      if (input[i].type.match(/^image\//) && this._resize.length > 0) {
        this._prepareResize(files, input[i]);
      } else {
        files[files.length] = { file: input[i] };
      }
    }

    each(files, ({ file, resize }, eachCallback) => {
      const stream = createReadStream(file.tmppath);

      if (resize) {
        this._writeResize(stream, file, resize, eachCallback);
      } else {
        this._writeRaw(stream, file, eachCallback);
      }
    }, (error) => {
      if (error) {
        this.fail(request, error, callback);
      } else {
        this.pass(request, data, callback);
      }
    });
  }

  _prepareResize(files, file) {
    for (let i = 0; i < this._resize.length; i += 1) {
      files[files.length] = {
        file,
        resize: this._resize[i]
      };
    }
  }

  _writeResize(stream, file, resize, callback) {
    stream
      .pipe(sharp())
      .rotate(resize.rotate)
      .resize(resize.width, resize.height)
      .withMetadata()
      .toFile(file.path + '-' + resize.postfix, (error, info) => {
        if (error) {
          callback(error);
          return;
        }

        const isOriginal = typeof resize.width === 'undefined' &&
          typeof resize.height === 'undefined';

        if (isOriginal) {
          file.size = info.size;
        }

        callback();
      });
  }

  _writeRaw(stream, file, callback) {
    const writer = createWriteStream(file.path + '-' + this._postfix);

    writer.once('error', (error) => {
      callback(error);
    });

    writer.once('finish', () => {
      callback();
    });

    stream.pipe(writer);
  }
}
