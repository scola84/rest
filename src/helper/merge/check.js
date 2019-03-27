export default function mergeCheck(parent) {
  return (request, data, { key, query, result }) => {
    const isVirtual = typeof request.virtual !== 'undefined' &&
      key !== null &&
      request.virtual.indexOf(key.name) !== -1;

    const count = typeof request.body.count === 'undefined' ?
      1 : request.body.count;

    if (isVirtual === false && result.length !== count) {
      throw new Error('403 Modification not allowed' +
        ` (expected ${count}, found ${result.length})`);
    }

    request.check = request.check || {};
    request.check[parent.name || 'default'] = result;

    if (result.length > 0 && parent.scope) {
      result = result[0];

      const found = request.user.may({
        scope: parent.scope
      }, request, {
        data: result
      });

      if (found === false) {
        throw new Error('403 Modification not allowed' +
          ` (${result.scope} is not equal to ${parent.scope})`);
      } else {
        data = data === '' ? {} : data;
        data.meta = { scope: result.scope };
      }
    }

    if (parent.merge) {
      data = parent.merge(request, data, { key, query, result });
    }

    return data;
  };
}
