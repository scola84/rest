export default function mergeCheck(parent) {
  return (request, data, { query, result }) => {
    const count = typeof request.body.count === 'undefined' ?
      1 : request.body.count;

    if (result.length !== count) {
      throw new Error('403 Modification not allowed' +
        ` (expected ${count}, found ${result.length})`);
    }

    if (typeof parent.merge === 'function') {
      return parent.merge(request, data, { query, result });
    }

    request.check = request.check || {};
    request.check[parent.name || 'default'] = result;

    let meta = {};

    if (parent.scope) {
      result = result[0];

      const found = request.user.may({
        scope: parent.scope
      }, request, {
        data: result
      });

      if (found === false) {
        throw new Error('403 Modification not allowed' +
          ` (${result.scope} not found in ${parent.scope})`);
      } else {
        meta = { scope: result.scope };
      }
    }

    return request.body.type === 'multipart/form-data' ?
      data : { data, meta };
  };
}
