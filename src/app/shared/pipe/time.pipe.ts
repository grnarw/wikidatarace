import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime'
})
export class TimePipe implements PipeTransform {

  transform(value: number): string {
    const minutes: string = Math.floor(value / 60).toString().padStart(2, '0');
    const seconds: string = (value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

}
