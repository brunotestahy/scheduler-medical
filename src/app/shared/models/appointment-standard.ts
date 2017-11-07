import {AppointmentType} from './appointment-type';

export interface AppointmentStandard {
  id?: string;
  version?: string;
  url: string;
  name: string;
  status: string;
  description: string;
  values: AppointmentType[];
}
