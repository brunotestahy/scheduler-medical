import { Period } from './period';
import { CareplanActivity } from './careplan-activity';

export interface Careplan {
  id?: string;
  version?: string;
  patientId?: string;
  status?: string;
  period?: Period;
  authorId?: string;
  modified?: string;
  description?: string;
  participants?: string[];
  goalIds?: string[];
  goals?: string;
  activities?: CareplanActivity[];
}
