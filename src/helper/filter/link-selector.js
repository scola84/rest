export default function filterLinkSelector() {
  return (request) => {
    return { where: [request.params[1]] };
  };
}
