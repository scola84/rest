export default function filterImport(object, name) {
  return (box, data) => {
    return data.output[object][name];
  };
}
