import { Selector } from '@scola/rest';

import {
  Broadcaster,
  Rotator,
  Slicer,
  Unifier,
  Worker
} from '@scola/worker';

import defaults from 'lodash-es/defaultsDeep';
import merge from 'lodash-es/merge';

const roptions = {
  count: 10,
  pick: {
    index: 1,
    total: 1
  }
};

export function changeRotation(options) {
  merge(roptions, options);
}

export function createRotation(inner, query, options = {}) {
  options = defaults(options, roptions);

  const broadcaster = new Broadcaster({
    id: 'rest-rotation-broadcaster',
    name: 'rotation-broadcaster'
  });

  const lister = new Selector({
    id: 'rest-rotation-lister',
    merge(box, data, { result }) {
      return {
        items: result
      };
    }
  });

  const responder = new Worker({
    id: 'rest-rotation-responder'
  });

  const rotatorBegin = new Rotator({
    count: options.count,
    id: 'rest-rotation-rotator-begin'
  });

  const rotatorEnd = new Rotator({
    begin: rotatorBegin,
    filter: (box) => box.unify['rest-rotation'].total,
    id: 'rest-rotation-rotator-end'
  });

  const slicer = new Slicer({
    filter(box, data) {
      return data.items;
    },
    id: 'rest-rotation-slicer',
    merge(box, data, items, begin, end) {
      return [box, items.slice(begin, end).pop()];
    },
    name: 'rest-rotation',
    pick: options.pick
  });

  const unifier = new Unifier({
    id: 'rest-rotation-unifier',
    name: 'rest-rotation'
  });

  broadcaster
    .connect(responder);

  broadcaster
    .connect(rotatorBegin)
    .connect(query.list(lister))
    .connect(slicer
      .bypass(unifier))
    .connect(inner)
    .connect(unifier)
    .connect(rotatorEnd);

  return [broadcaster, responder];
}
