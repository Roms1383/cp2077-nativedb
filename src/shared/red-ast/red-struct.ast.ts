import {RedObjectAst} from "./red-object.ast";
import {RedPropertyAst, RedPropertyJson} from "./red-property.ast";
import {RedFunctionAst, RedFunctionJson} from "./red-function.ast";
import {RedOriginDef, RedScopeDef} from "./red-definitions.ast";

export interface RedStructJson {
  // name
  readonly a: string;
  // flags
  readonly d?: number;
  // parent
  readonly f?: string;
  // properties
  readonly g?: RedPropertyJson[];
  // functions
  readonly h?: RedFunctionJson[];
}

export interface RedStructAst extends RedObjectAst {
  readonly scope: RedScopeDef;
  readonly origin: RedOriginDef;
  readonly parent?: string;
}

export class RedStructAst {
  static fromJson(json: RedStructJson): RedStructAst {
    const flags: number = json.d ?? 0;
    const scope: RedScopeDef = flags & 3;
    const origin: RedOriginDef = (flags >> 2) & 3;

    return {
      name: json.a,
      scope: scope,
      origin: origin,
      parent: json.f,
      properties: json.g?.map((item) => RedPropertyAst.fromJson(item)) ?? [],
      functions: json.h?.map((item) => RedFunctionAst.fromJson(item)) ?? [],
    };
  }
}
