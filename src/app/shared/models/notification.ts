import { EnumNotificationType } from '../enums/notification-type.enum';
import { EnumNotificationOperation } from '../enums/notification-operation-enum';

export interface Notification {
 type?: EnumNotificationType;
 operation?: EnumNotificationOperation;
}
