
import { Period } from './period';

export interface AppointmentType {
  system?: string;
  abstract?: boolean;
  code?: string;
  display: string;
  definition: string;
  unusable: boolean;
  category: {
    system: string,
    code: string
  };
  videoLink: string;
  standardPeriod: Period;
  allDayLong: boolean;
}
