export interface AppointmentList {
  id?: string;
  version?: string;
  title: string;
  patientId: string;
  status: string;
  system?: string;
  date: {
    dateTime: string;
  };
  orderedBy: string;
  mode: string;
  note: string;
  entries: string[];
  followingCategoryDefault: string[];
  hisAdtId?: string;
}
