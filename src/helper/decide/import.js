export default function decideImport(checkExists, checkForce, map) {
  return (box, data) => {
    const load = box.import.load === true;

    let decide = true;
    let exists = true;
    let force = true;

    if (checkForce === true) {
      force = box.import.force === true;
    }

    if (map.unique !== true) {
      if (checkExists === true) {
        exists = box.exists === true;
      } else if (checkExists === null) {
        exists = box.exists !== true;
      }
    }

    if (map.decide) {
      decide = map.decide(box, data.data);
    }

    if (map.key) {
      box.params = [null].concat(map.key(box, data.data));
    }

    return load && decide && exists && force;
  };
}
