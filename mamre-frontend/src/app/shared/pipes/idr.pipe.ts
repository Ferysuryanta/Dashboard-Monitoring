import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'idr', standalone: true })
export class IdrPipe implements PipeTransform {
  transform(value: number | string | undefined | null): string {
    if (value == null || value === '') return '';
    const n = typeof value === 'number' ? value : Number(value);
    if (isNaN(n)) return String(value);
    return n.toLocaleString('id-ID');
  }
}
