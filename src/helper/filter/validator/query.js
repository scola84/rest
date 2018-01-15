export default function filterQueryValidator() {
  return (request) => {
    return request.parseUrl().query;
  };
}
