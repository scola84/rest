const formatters = {
  string: (a, b) => `${a} << ${b}`,
  value: (a, b) => a << b
};

const parsers = {
  string: (a, b, c) => `${a} >> ${b} & ${c}`,
  value: (a, b, c) => a >> b & c
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
      sum = 0;

      for (let j = i + 1; j < bits.length; j += 1) {
        sum += bits[j];
      }

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
      sum = 0;

      for (let j = i + 1; j < bits.length; j += 1) {
        sum += bits[j];
      }

      result[result.length] = parsers[type](arg, sum, bit);
    }

    return result;
  }
}
