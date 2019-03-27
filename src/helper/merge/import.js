export default function mergeImport() {
  return (box, data, items, begin, end) => {
    const importBox = Object.assign({
      begin,
      body: {},
      data,
      import: box.box.box.import,
      parseUrl: () => box.box.box.parseUrl(),
      user: box.box.box.user,
      virtual: box.box.virtual
    }, box);

    return [importBox, { data: items.slice(begin, end).pop() || {} }];
  };
}
