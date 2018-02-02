export default function mergeLink() {
  return (request, data, { result }) => {
    data.link = result;
    return data;
  };
}
