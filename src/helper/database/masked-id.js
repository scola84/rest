import Long from 'long';

const formatters = {
  string: (a, b) => {
    return `${a} << ${b}`;
  },
  value: (a, b) => {
    a = Long.fromNumber(a);
    b = Long.fromNumber(b);

    return a
      .shiftLeft(b)
      .toNumber();
  }
};

const parsers = {
  string: (a, b, c) => {
    return `${a} >> ${b} & ${c}`;
  },
  value: (a, b, c) => {
    a = Long.fromNumber(a);
    b = Long.fromNumber(b);
    c = Long.fromNumber(c);

    return a
      .shiftRight(b)
      .and(c)
      .toNumber();
  }
};

const unsetters = {
  string: (a, b) => {
    return `${a} & ~${b}`;
  },
  value: (a, b) => {
    a = Long.fromNumber(a);
    b = Long.fromNumber(b);

    return a
      .and(b.not())
      .toNumber();
  }
};

const ids = {};

export default class MaskedId {
  static createId(name, bits) {
    ids[name] = bits;
  }

  constructor(options) {
    this._name = null;
    this.setName(options.name);
  }

  setName(value = null) {
    this._name = value;
    return this;
  }

  format(type, ...args) {
    const bits = ids[this._name].bits;
    const result = [];

    let sum = null;

    for (let i = 0; i < bits.length; i += 1) {
      sum = this._sum(bits, i);
      result[result.length] = formatters[type](args[i], sum);
    }

    return result;
  }

  parse(type, arg) {
    const bits = ids[this._name].bits;
    const result = [];

    let bit = null;
    let sum = null;

    for (let i = 0; i < bits.length; i += 1) {
      bit = (2 ** bits[i]) - 1;
      sum = this._sum(bits, i);
      result[result.length] = parsers[type](arg, sum, bit);
    }

    return result;
  }

  unset(type, arg, from) {
    const bits = ids[this._name].bits;
    const sum = this._sum(bits, from - 1);

    return unsetters[type](arg, (2 ** sum) - 1);
  }

  _sum(bits, i) {
    let sum = 0;

    for (let j = i + 1; j < bits.length; j += 1) {
      sum += bits[j];
    }

    return sum;
  }
}
