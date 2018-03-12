import { schema } from 'normalizr';

import { EntitySchema } from './entity-factory';
import { createEntityRelationKey, EntityInlineParentAction, EntityTree, EntityTreeRelation } from './entity-relations.types';

const entityTreeCache: {
  [entityKey: string]: EntityTree
} = {};

function generateCacheKey(entityKey: string, action: EntityInlineParentAction): string {
  let includeRelations = action.includeRelations || [];
  includeRelations = includeRelations.sort((a, b) => {
    return a.localeCompare(b);
  });
  return entityKey + '+' + includeRelations.join(',');
}

export function fetchEntityTree(action: EntityInlineParentAction): EntityTree {
  let entity = action.entity;
  const isArray = entity['length'] > 0;
  entity = isArray ? entity[0] : entity;
  const entityKey = entity['key'];
  const cacheKey = generateCacheKey(entityKey, action);
  let entityTree = entityTreeCache[cacheKey];
  if (!entityTree) {
    const rootEntityRelation = new EntityTreeRelation(
      entity as EntitySchema,
      isArray,
      null,
      '',
      new Array<EntityTreeRelation>()
    );
    entityTree = {
      rootRelation: rootEntityRelation,
      requiredParamNames: new Array<string>(),
    };
    createEntityTree(entityTree, rootEntityRelation);
    entityTreeCache[cacheKey] = entityTree;
    // console.log('fetchEntity: Not Found');
  } else {
    // console.log('fetchEntity: Found');
  }
  // Calc max depth and exclude not needed
  entityTree.rootRelation.childRelations = parseEntityTree(entityTree, entityTree.rootRelation, action.includeRelations);
  return entityTree;
}

export function createEntityTree(tree: EntityTree, entityRelation: EntityTreeRelation, schemaObj?, path: string = '') {
  const rootEntitySchema = schemaObj || entityRelation.entity['schema'];
  Object.keys(rootEntitySchema).forEach(key => {
    let value = rootEntitySchema[key];
    const isArray = value['length'] > 0;
    value = isArray ? value[0] : value;

    const newPath = path ? path + '.' + key : key;
    if (value instanceof schema.Entity) {
      const newEntityRelation = new EntityTreeRelation(
        value as EntitySchema,
        isArray,
        key,
        newPath,
        new Array<EntityTreeRelation>()
      );
      entityRelation.childRelations.push(newEntityRelation);
      createEntityTree(tree, newEntityRelation, null, '');
    } else if (value instanceof Object) {
      createEntityTree(tree, entityRelation, value, newPath);
    }
  });
}

export function parseEntityTree(tree: EntityTree, entityRelation: EntityTreeRelation, includeRelations: string[] = [])
  : EntityTreeRelation[] {
  const newChildRelations = new Array<EntityTreeRelation>();
  entityRelation.childRelations.forEach((relation, index, array) => {
    const parentChildKey = createEntityRelationKey(entityRelation.entityKey, relation.entityKey);
    if (includeRelations.indexOf(parentChildKey) >= 0) {
      const clone = { ...relation };
      newChildRelations.push(clone);
      if (tree.requiredParamNames.indexOf(relation.paramName) < 0) {
        tree.requiredParamNames.push(relation.paramName);
      }
      clone.childRelations = parseEntityTree(tree, relation, includeRelations);
    }
  });
  entityRelation.childRelations = newChildRelations;
  if (entityRelation.childRelations.length) {
    tree.maxDepth = tree.maxDepth || 0;
    tree.maxDepth++;
  }
  return newChildRelations;
}

