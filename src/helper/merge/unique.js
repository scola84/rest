export default function mergeUnique(addData = false) {
  return (request, data, { result: [object] }) => {
    if (typeof object === 'undefined') {
      return { data };
    }

    const id = Object.values(object).pop();

    request.params = [null].concat(String(id).split(','));
    request.exists = true;

    return {
      data: Object.assign({}, object, addData ? data : {})
    };
  };
}
