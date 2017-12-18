import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class RefreshService {

  // Observable string sources
  private refreshStateSource = new Subject<boolean>();

  constructor() {
  }

  // Observable string streams
  handleRefreshState$ = this.refreshStateSource.asObservable();

  // Service message commands
  emitRefreshState(state: boolean) {
    this.refreshStateSource.next(state);
  }
}
