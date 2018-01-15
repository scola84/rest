export default function mergeObjectSelector() {
  return (request, data, object) => {
    if (request.method === 'GET') {
      if (object && object.deleted === null) {
        data.object = object;
      }
    } else if (typeof object === 'undefined') {
      throw new Error('403');
    }
  };
}
