export default function decideMeta() {
  return (request, data = {}) => {
    return typeof data.data !== 'undefined' &&
      typeof request.params[1] !== 'undefined';
  };
}
