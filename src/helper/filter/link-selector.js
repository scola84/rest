export default function filterLinkSelector() {
  return (request) => {
    return Object.assign({}, request.parseUrl().query, {
      where: [request.params[1]]
    });
  };
}
