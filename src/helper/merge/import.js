export default function mergeImport() {
  return (box, data, items, begin, end) => {
    box = Object.assign({
      begin,
      data,
      import: box.box.box.import,
      user: box.box.box.user
    }, box);

    return [box, { data: items.slice(begin, end).pop() }];
  };
}
