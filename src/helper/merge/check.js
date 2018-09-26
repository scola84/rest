export default function mergeCheck(parent) {
  return (request, data, { query, result }) => {
    const count = typeof request.body.count === 'undefined' ?
      1 : request.body.count;

    if (result.length !== count) {
      throw new Error('403 Modification not allowed' +
        ` (expected ${count}, found ${result.length})`);
    }

    request.check = request.check || {};
    request.check[parent.name || 'default'] = result;

    if (parent.scope) {
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
      data = parent.merge(request, data, { query, result });
    }

    return data;
  };
}
