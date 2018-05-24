export default function decideImport(checkMeta = false, checkForce = false) {
  return (request, data) => {
    const load = request.load === true;

    let meta = true;
    let force = true;

    if (checkMeta === true) {
      meta = typeof data.meta !== 'undefined' &&
        data.meta.exists === true;
    } else if (checkMeta === null) {
      meta = typeof data.meta === 'undefined';
    }

    if (checkForce === true) {
      force = request.force === true;
    }

    return load && meta && force;
  };
}
