export default function filterIdValidator(name) {
  return (request) => {
    return {
      [name + '_id']: request.params[1]
    };
  };
}
