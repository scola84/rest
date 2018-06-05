export default function decideImport(checkExists, checkForce, map) {
  return (box, data) => {
    const load = box.import.load === true;

    let exists = true;
    let force = true;
    let include = true;

    if (map.unique !== true) {
      if (checkExists === true) {
        exists = box.exists === true;
      } else if (checkExists === null) {
        exists = box.exists !== true;
      }
    }

    if (checkForce === true) {
      force = box.import.force === true;
    }

    if (map.decide) {
      include = map.decide(box, data.data);
    }

    if (map.key) {
      box.params = [null].concat(map.key(box, data.data));
    }

    data.data.include = include;

    return load && exists && force && include;
  };
}
