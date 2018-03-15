export default function filterData(defaultValue = {}) {
  return (request, data = {}) => {
    return data.data || defaultValue;
  };
}
