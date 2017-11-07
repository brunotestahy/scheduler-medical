import { EnumEventCategory } from '../enums/event-categories.enum';

export interface Event {
  id?: number;
  internalID?: number;
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  owner?: string;
  patientId?: string;
  practitionersId?: Array<string>;
  editable?: boolean;
  backgroundColor?: string;
  category?: EnumEventCategory;
  type?: string;
  videoLink?: string;
  standard?: boolean;
}
