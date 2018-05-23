export default function filterImport(name, sub) {
  return (box, data) => {
    return data.output[name][sub];
  };
}
