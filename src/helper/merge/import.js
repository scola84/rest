export default function mergeImport() {
  return (box, data, items, begin, end) => {
    box = Object.assign({
      data,
      begin
    }, box);

    return [box, items.slice(begin, end).pop()];
  };
}
