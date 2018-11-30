import { Selector } from '@scola/rest';
import { mergeCheck } from '../helper';

export default function createCheck(child, ...parents) {
  const workers = [];
  let parent = null;

  for (let i = 0; i < parents.length; i += 1) {
    parent = parents[i];

    workers[i] = new Selector({
      decide: child.getDecide(),
      id: parent.id,
      merge: mergeCheck(parent)
    });

    workers[i] = parent.setup(workers[i], {
      del,
      limit,
      link,
      list,
      object
    });
  }

  workers[workers.length] = child;

  for (let i = 1; i < workers.length; i += 1) {
    workers[i - 1].connect(workers[i]);
  }

  return [workers.shift(), workers.pop()];
}

function del(viewer, index = 0) {
  return viewer.where({
    required: false,
    value: (request, { data }) => {
      return data.action === 'delete' ? 'NULL' : null;
    }
  }, index);
}

function link(viewer, index = 1) {
  return viewer.where({
    value: (request) => {
      return [request.params[2]];
    }
  }, index);
}

function limit(viewer) {
  const key = viewer.getKey();

  return viewer.limit((request, { data }) => {
    return {
      offset: 0,
      count: data[key.name].length
    };
  });
}

function list(viewer, index = 1) {
  const key = viewer.getKey();

  return viewer.where({
    columns: key.table ? `${key.table}.${key.name}` : key.name,
    operator: 'IN',
    value: (request, { data }) => {
      request.body.count = data[key.name].length;
      return [data[key.name]];
    }
  }, index);
}

function object(viewer, index = 1) {
  const key = viewer.getKey();

  return viewer.where({
    value: (request, { data }) => {
      return data[key.name];
    }
  }, index);
}
