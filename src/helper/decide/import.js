export default function decideImport(checkExists, checkForce, key) {
  return (box, data) => {
    const load = box.import.load === true;

    let exists = true;
    let force = true;

    if (checkExists === true) {
      exists = box.exists === true;
    } else if (checkExists === null) {
      exists = box.exists !== true;
    }

    if (checkForce === true) {
      force = box.import.force === true;
    }

    if (key) {
      box.params = [null].concat(key(box, data.data));
    }

    return load && exists && force;
  };
}
