import { Period } from './period';

export interface Appointment {
  id?: string;
  status?: string;
  type?: string;
  description?: string;
  period?: Period;
  comment?: string;
  owner?: string;
  patientId?: string;
  practitionersId?: any[];
  motiveRef?: any;
  motive?: any;
}
