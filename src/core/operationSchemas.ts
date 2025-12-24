import { z } from 'zod';
import type { OperationDef, OperationParam } from './spec.js';
import { schemas as vrchatSchemas } from '../generated/vrchat-schemas.js';

type ComponentsSchemas = Record<string, unknown> | undefined;
type ZodSchemaMap = Record<string, z.ZodTypeAny>;

const zodSchemas = vrchatSchemas as ZodSchemaMap;

function refNameFromSchema(schema: unknown): string | undefined {
  if (!schema || typeof schema !== 'object') return undefined;
  const ref = (schema as { $ref?: unknown }).$ref;
  if (typeof ref !== 'string') return undefined;
  return ref.split('/').pop();
}

function derefSchema(
  schema: unknown,
  componentsSchemas: ComponentsSchemas,
  seen = new Set<string>(),
): unknown {
  if (!schema || typeof schema !== 'object') return schema;
  if (Array.isArray(schema)) {
    return schema.map((entry) => derefSchema(entry, componentsSchemas, seen));
  }

  const refName = refNameFromSchema(schema);
  if (refName && componentsSchemas && refName in componentsSchemas) {
    if (seen.has(refName)) return schema;
    seen.add(refName);
    return derefSchema(componentsSchemas[refName], componentsSchemas, seen);
  }

  const clone: Record<string, unknown> = { ...(schema as Record<string, unknown>) };
  if (clone.properties && typeof clone.properties === 'object') {
    const nextProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      clone.properties as Record<string, unknown>,
    )) {
      nextProps[key] = derefSchema(value, componentsSchemas, seen);
    }
    clone.properties = nextProps;
  }
  if ('items' in clone) {
    clone.items = derefSchema(clone.items, componentsSchemas, seen);
  }
  if (Array.isArray(clone.anyOf)) {
    clone.anyOf = clone.anyOf.map((entry) =>
      derefSchema(entry, componentsSchemas, seen),
    );
  }
  if (Array.isArray(clone.oneOf)) {
    clone.oneOf = clone.oneOf.map((entry) =>
      derefSchema(entry, componentsSchemas, seen),
    );
  }
  if (Array.isArray(clone.allOf)) {
    clone.allOf = clone.allOf.map((entry) =>
      derefSchema(entry, componentsSchemas, seen),
    );
  }
  return clone;
}

function schemaToZod(
  schema: unknown,
  componentsSchemas: ComponentsSchemas,
): z.ZodTypeAny {
  const refName = refNameFromSchema(schema);
  if (refName && zodSchemas[refName]) {
    return zodSchemas[refName];
  }
  try {
    const deref = derefSchema(schema, componentsSchemas);
    if (typeof deref === 'boolean') {
      return z.fromJSONSchema(deref);
    }
    if (deref && typeof deref === 'object') {
      return z.fromJSONSchema(deref as Record<string, unknown>);
    }
    return z.any();
  } catch {
    return z.any();
  }
}

function describeSchema(schema: z.ZodTypeAny, description?: string) {
  return description ? schema.describe(description) : schema;
}

export function buildParamsSchema(
  params: OperationParam[],
  componentsSchemas: ComponentsSchemas,
  options?: { aliasNumberForN?: boolean },
): { schema?: z.ZodObject<any>; required: boolean } {
  if (!params.length) return { schema: undefined, required: false };
  const shape: Record<string, z.ZodTypeAny> = {};
  let required = false;

  for (const param of params) {
    const baseSchema = param.schema
      ? schemaToZod(param.schema, componentsSchemas)
      : z.any();
    const described = describeSchema(baseSchema, param.description);
    shape[param.name] = param.required ? described : described.optional();
    if (param.required) required = true;

    if (options?.aliasNumberForN && param.name === 'n' && !shape.number) {
      shape.number = described.optional();
    }
  }

  return { schema: z.object(shape).passthrough(), required };
}

export function buildRequestBodySchema(
  op: OperationDef | undefined,
  componentsSchemas: ComponentsSchemas,
): { schema?: z.ZodTypeAny; required: boolean } {
  if (!op) return { schema: undefined, required: false };
  const required = Boolean(op.requestBodyRequired);
  if (op.requestBodySchema) {
    const base = schemaToZod(op.requestBodySchema, componentsSchemas);
    const described = describeSchema(base, op.requestBodyDescription);
    return { schema: described, required };
  }
  if (op.hasRequestBody) {
    return { schema: z.any(), required };
  }
  return { schema: undefined, required: false };
}
