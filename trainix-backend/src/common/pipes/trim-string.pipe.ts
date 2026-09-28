import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimStringPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;
    return this.trimStrings(value);
  }

  private trimStrings(obj: any): any {
    if (typeof obj === 'string') return obj.trim();
    if (Array.isArray(obj)) return obj.map((item) => this.trimStrings(item));
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce(
        (acc, key) => ({ ...acc, [key]: this.trimStrings(obj[key]) }),
        {},
      );
    }
    return obj;
  }
}
