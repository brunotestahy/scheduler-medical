export interface CareplanActivityType {
  id?: string;
  version?: string;
  system?: string;
  code?: string;
  display?: string;
  definition?: string;
  unusable?: boolean;
  category?: {
    system?: string;
    code?: string;
  };
  videoLink?: string;
}
