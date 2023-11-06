import {Pipe, PipeTransform} from '@angular/core';
import {Game} from "../model/game.model";

@Pipe({
  name: 'orderByDate'
})
export class OrderByDatePipe implements PipeTransform {

  transform(value: Game[], args?: any): Game[] {
    return value.sort((a, b) => {
      return new Date(b.start).getTime() - new Date(a.start).getTime();
    });
  }

}
