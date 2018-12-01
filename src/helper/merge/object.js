import omit from 'lodash-es/omit';

export default function mergeObject(type = 'data', omitPaths = []) {
  return (request, data, { result: [object] }) => {
    if (typeof object === 'undefined') {
      return object;
    }

    return {
      meta: data.meta,
      [type]: omit(object, omitPaths)
    };
  };
}
