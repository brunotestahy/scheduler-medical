import { Period } from './period';

export interface CareplanActivity {
  id?: string;
  version?: string;
  message?: string;
  progress?: string;
  type?: string;
  typeDisplay?: string;
  categoryDisplay?: string;
  status?: string;
  statusReason?: string;
  scheduledPeriod?: Period;
}
