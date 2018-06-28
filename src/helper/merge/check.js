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

    let meta = {};
    let found = false;

    if (parent.scope) {
      result = result[0];

      for (let i = 0; i < parent.scope.length; i += 1) {
        found = found || result.scope === parent.scope[i];
      }

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
