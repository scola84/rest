import { Worker } from '@scola/worker';
import each from 'async/each';
import { createReadStream, createWriteStream } from 'fs';
import sharp from 'sharp';
import shortid from 'shortid';

export default class FileWriter extends Worker {
  constructor(options = {}) {
    super(options);

    this._basePath = null;
    this._postfix = null;
    this._resize = null;

    this.setBasePath(options.basePath);
    this.setPostfix(options.postfix);
    this.setResize(options.resize);
  }

  setBasePath(value = '/tmp/') {
    this._basePath = value;
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
      input[i].path = this._basePath + date + '-' + shortid.generate();

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