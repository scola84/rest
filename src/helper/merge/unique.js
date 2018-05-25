export default function mergeUnique(addData = false) {
  return (request, data, { result: [object] }) => {
    if (typeof object === 'undefined') {
      return { data };
    }

    request.exists = true;

    data = Object.assign({
      exists: true
    }, object, addData ? data : {});

    return { data };
  };
}
