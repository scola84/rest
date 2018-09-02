import {
  Broadcaster,
  Unifier,
  Worker
} from '@scola/worker';

import {
  Checker,
  Exporter,
  Normalizer
} from '../export';

export default function createExport(exprt) {
  const broadcaster = new Broadcaster({
    decide(box, data) {
      return data.input.error ? null : true;
    },
    id: 'rest-export-broadcaster'
  });

  const checker = new Checker({
    id: 'rest-export-checker'
  });

  const normalizer = new Normalizer({
    id: 'rest-export-normalizer'
  });

  const resolver = new Worker({
    id: 'rest-export-resolver'
  });

  const unifier = new Unifier({
    id: 'rest-export-unifier'
  });

  const names = Object.keys(exprt);

  let name = null;
  let exporter = null;

  for (let i = 0; i < names.length; i += 1) {
    name = names[i];

    exporter = new Exporter({
      id: 'rest-export-exporter',
      map: exprt[name],
      name
    });

    broadcaster
      .connect(exporter)
      .connect(unifier);
  }

  normalizer
    .connect(checker)
    .connect(broadcaster);

  unifier
    .connect(resolver);

  broadcaster
    .bypass(resolver);

  return [normalizer, resolver];
}
