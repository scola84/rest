export default function mergeUnique() {
  return (request, data, { result: [object] }) => {
    if (typeof object === 'undefined') {
      return data;
    }

    return {
      meta: Object.assign({ exists: true }, object),
      data: Object.assign({}, object, data)
    };
  };
}
