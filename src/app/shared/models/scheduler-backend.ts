export interface SchedulerBackend {
  //
  // system: "ext:categorizableelement:category"
  display: string;
  definition: string;
  code: string;
  system: string;
  allDayLong: string;
  category: {
    system: string,
    code: string
  };
  standardPeriod: {
    startDate: string,
    endDate: string
  };
}
