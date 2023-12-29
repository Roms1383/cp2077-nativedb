import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {RedPrimitiveDef} from "../../shared/red-ast/red-definitions.ast";

@Pipe({
  name: 'ndbFormatDocumentation',
  standalone: true
})
export class NDBFormatDocumentationPipe implements PipeTransform {

  private static readonly LINK_RULE: RegExp = RegExp(/\[(?<type>[A-Za-z_-]*)]/g);
  private static readonly PRIMITIVES: string[] = [];

  constructor(private readonly sanitizer: DomSanitizer) {
    if (NDBFormatDocumentationPipe.PRIMITIVES.length === 0) {
      for (let i = RedPrimitiveDef.Void; i <= RedPrimitiveDef.Variant; i++) {
        NDBFormatDocumentationPipe.PRIMITIVES.push(RedPrimitiveDef[i]);
      }
    }
  }

  transform(body: string): SafeHtml {
    const matches: RegExpMatchArray[] = [...body.matchAll(NDBFormatDocumentationPipe.LINK_RULE)];

    body = body.replaceAll('\n', '<br>');
    body = body.replaceAll(' ', '&nbsp;');
    matches.reverse();
    for (const match of matches) {
      const type: string = match.groups!['type'];
      const $link: string = this.createLink(type);

      body = body.replace(match[0], $link);
    }
    return this.sanitizer.bypassSecurityTrustHtml(body);
  }

  private createLink(type: string): string {
    const isPrimitive: boolean = NDBFormatDocumentationPipe.PRIMITIVES.some((primitive) => primitive === type);

    if (isPrimitive) {
      return `<span class="stx-type">${type}</span>`;
    }
    return `<a class="stx-type" title="Navigate to ${type}" data-route="/${type}">${type}</a>`;
  }

}
