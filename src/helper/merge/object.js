export default function mergeObject(type = 'data') {
  return (request, data, { result: [object] }) => {
    return typeof object === 'undefined' ? object : {
      [type]: object
    };
  };
}
