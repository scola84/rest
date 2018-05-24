export default function decideImport(checkExists = false, checkForce = false) {
  return (box) => {
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

    return load && exists && force;
  };
}
