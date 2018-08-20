export default function decideImport(checkExists, checkForce, checkLoad,
  context, map) {

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
      const decision = map.decide(box, data.data, context);
      const [object, id = true] = Array.isArray(decision) ?
        decision : [decision];

      include = object && id;
      data.data.include = object;
    }

    if (checkLoad === true) {
      load = box.import.load === true;
    }

    if (map.key) {
      box.params = [null].concat(map.key(box, data.data, checkLoad));
    }

    return load && exists && force && include;
  };
}
