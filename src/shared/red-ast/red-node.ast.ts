export enum RedNodeKind {
  enum,
  bitfield,
  class,
  struct,
  property,
  function,
  type
}

export interface RedNodeAst {
  readonly id: number;
  readonly name: string;
  readonly kind: RedNodeKind;

  // Define alias, when it exists, while loading data.
  aliasName?: string;
}

export function getRedNodeKindName(kind: RedNodeKind): string {
  const name: string = RedNodeKind[kind];

  return `${name[0].toUpperCase()}${name.substring(1)}`;
}
