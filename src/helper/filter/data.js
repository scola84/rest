export default function filterData(defaultValue = {}, checkType = true) {
  return (request, data = {}) => {
    if (checkType === true) {
      if (request.body.type === 'multipart/form-data') {
        return data;
      }
    }

    if (typeof data.data !== 'undefined') {
      return data.data;
    }

    return defaultValue;
  };
}
