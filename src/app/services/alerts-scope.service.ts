import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Notification } from '../shared/models/notification';
import { Observable } from 'rxjs/Observable';
import { EnumNotificationType } from '../shared/enums/notification-type.enum';
import { EnumNotificationOperation } from '../shared/enums/notification-operation-enum';

@Injectable()
export class AlertsScopeService {

  // Observable string sources
  private notificationSource = new Subject<Notification>();

  constructor() { }

  // Observable string streams
  handleNotification$: Observable<{type: EnumNotificationType, counter: number}> = this.notificationSource
    .map((notification) => {
      let counter = 0;

      switch (notification.operation) {
        case EnumNotificationOperation.decrement: {
          counter = -1;
          break;
        }
        case EnumNotificationOperation.increment: {
          counter = 1;
          break;
        }
      }

      return { type: notification.type, counter };
    });

  // Service message commands
  emitNotification(type: EnumNotificationType, operation: EnumNotificationOperation) {
    this.notificationSource.next({ type, operation });
  }
}
