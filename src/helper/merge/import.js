export default function mergeImport() {
  return (box, data, items, begin, end) => {
    box = Object.assign({
      begin,
      data,
      force: box.box.box.force,
      load: box.box.box.load
    }, box);

    return [box, { data: items.slice(begin, end).pop() }];
  };
}
