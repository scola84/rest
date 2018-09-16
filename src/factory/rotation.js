import { Selector } from '@scola/rest';

import {
  Broadcaster,
  Rotator,
  Slicer,
  Unifier,
  Worker
} from '@scola/worker';

export default function createRotation(inner, query, config) {
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
    count: config.rotator.count,
    id: 'rest-rotation-rotator-begin'
  });

  const rotatorEnd = new Worker({
    act(box) {
      const total = box.unify['rotation-slicer'].total;

      rotatorBegin.rotate(box, total);

      if (box.limit.offset > 0) {
        rotatorBegin.handle(box);
      }
    },
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
    name: 'rotation-slicer'
  });

  const unifier = new Unifier({
    id: 'rest-rotation-unifier',
    name: 'rotation-slicer'
  });

  broadcaster
    .connect(responder);

  broadcaster
    .connect(rotatorBegin)
    .connect(query.list(lister))
    .connect(slicer)
    .connect(inner)
    .connect(unifier)
    .connect(rotatorEnd);

  return [broadcaster, responder];
}
