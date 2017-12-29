import { Event } from './event';
import { EventCategoryStyle } from './event-category-style';
import { EnumUserType } from '../enums/user-type.enum';
import { Patient } from './patient';
import { Practitioner } from 'front-end-common';
import { AppointmentType } from './appointment-type';
import { AppointmentCategory } from './appointment-category';
import { AppointmentStandard } from './appointment-standard';
import { AppointmentList } from './appointment-list';

export interface Scheduler {
  header?: {
    left: string,
    center: string,
    right: string
  };
  newEventHeader?: {
    active: boolean,
    title1?: string,
    title2?: string,
    buttonLabel?: string,
    patientName?: string
  };
  i18nLanguage?:  {
    active: boolean
  };
  allDayText?: string;
  practitioner?: {
    thumbnail?: {
      height: string,
      width: string,
      border: string,
      photo: string
    }
  };
  currentEvent?: Event;
  initialEvents?: Array<Event>;
  updatedEvents?: Array<Event>;
  eventCategoryStyles?: {
    refeicao?: EventCategoryStyle;
    higiene?: EventCategoryStyle;
    exames?: EventCategoryStyle;
    curativo?: EventCategoryStyle;
    fisioterapia?: EventCategoryStyle;
    fonoaudiologia?: EventCategoryStyle;
    medicacao?: EventCategoryStyle;
    procedimento?: EventCategoryStyle;
    outros?: EventCategoryStyle;
  };
  color?: string;
  textColor?: string;
  borderColor?: string;
  editable?: boolean;
  aspectRatio?: number;
  slotEventOverlap?: boolean;
  defaultView?: string;
  scrollTime?: string;
  timeFormat?: string;
  onlineMode?: boolean;
  options?: {
    theme?: boolean,
    themeSystem?: string,
    slotLabelFormat?: string,
    agendaEventMinHeight?: number
  };
  appointmentTypes?: AppointmentType[];
  appointmentTypesFiltered?: AppointmentType[];
  appointmentCategory?: AppointmentCategory[];
  appointmentStandard?: AppointmentStandard;
  appointmentList?: AppointmentList[];
  userType?: EnumUserType;
  patientData?: Patient;
  practitionerData?: Practitioner;
}
