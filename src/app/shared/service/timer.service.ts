import {Injectable} from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private stopwatch$: Observable<number> | undefined;
  private stop$ = new Subject<void>();

  startTimer(start: number = 0): Observable<number> {
    this.stopwatch$ = timer(0, 1000).pipe(
      map(tick => start + tick),
      takeUntil(this.stop$)
    );
    return this.stopwatch$;
  }

  stopTimer() {
    this.stop$.next();
  }
}
