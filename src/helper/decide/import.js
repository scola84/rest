export default function decideImport(checkExists, checkForce, checkLoad, map) {
  return (box, data) => {
    let exists = true;
    let force = true;
    let include = true;
    let load = true;

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
      include = map.decide(box, data.data, checkLoad);
    }

    if (checkLoad === true) {
      load = box.import.load === true;
    }

    if (map.key) {
      box.params = [null].concat(map.key(box, data.data, checkLoad));
    }

    data.data.include = include;

    return load && exists && force && include;
  };
}
