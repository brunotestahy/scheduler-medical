export interface Patient {
  id?: string;
  name?: string;
  fullName?: string;
  givenName?: Array<string>;
  familyName?: Array<string>;
  nameSuffix?: Array<string>;
  birthDate?: {
    dateTime?: string,
    age?: number
  };
  email?: string;
  hisAdtId?: string;
  mobilePhone?: string;
  photo?: string;
  login?: string;
  room?: string;
  roomId?: string;
  roomDisplay?: string;
  sectorId?: string;
  sectorDisplay?: string;
  careProviderIds?: string;
  careProviders?: string;
  cpf?: string;
  searchfield?: string;
}
