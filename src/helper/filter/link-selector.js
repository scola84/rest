export default function filterLinkSelector() {
  return (request) => {
    const query = request.parseUrl().query;
    const where = [
      request.params[1],
      request.params[2]
    ];

    return Object.assign({}, query, { where });
  };
}
