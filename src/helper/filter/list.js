export default function filterList() {
  return (request) => {
    return request.parseUrl().query;
  };
}
