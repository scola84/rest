export default function mergeCheck(merge) {
  return (request, data, { query, result }) => {
    const count = typeof request.body.count === 'undefined' ?
      1 : request.body.count;

    if (result.length !== count) {
      throw new Error('403 Modification not allowed' +
        ` (expected ${count}, found ${result.length})`);
    }

    return merge ? merge(request, data, { query, result }) :
      (request.body.type === 'multipart/form-data' ?
        data : { data });
  };
}
