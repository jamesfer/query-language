import { Observable, Observer } from 'rxjs';
import { tap, take, toArray, concatMap, delay } from 'rxjs/operators';
import { TeardownLogic } from 'rxjs/Subscription';

function makeExpensiveObservable(): Observable<number> {
  // return Observable.range(0, 10).pipe(
  //   tap(val => console.log('Output val', val)),
  // );
  // return Observable.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).pipe(
  //   tap(val => console.log('Output val', val)),
  // );
  Observable.create((observer: Observer<number>): TeardownLogic => {

  });
}

makeExpensiveObservable().pipe(
  delay(200),
  take(5),
  toArray(),
).subscribe((values) => {
  console.log('Completed', values);
});


