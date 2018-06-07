export default function mergeMeta() {
  return (request, data, { result: [meta] }) => {
    data.meta = meta;
    return data;
  };
}
