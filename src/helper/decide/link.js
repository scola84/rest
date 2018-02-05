export default function decideLink() {
  return (request, data = {}) => {
    return typeof data.data !== 'undefined';
  };
}
