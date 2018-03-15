export default function filterData(defaultValue = {}) {
  return (request, data = {}) => {
    return request.body.type === 'multipart/form-data' ?
      data : data.data || defaultValue;
  };
}
