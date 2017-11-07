export interface PatientCards {
    id?: string,
    name: string,
    fullName: string,
    givenName: string[],
    familyName: string[],
    nameSuffix: string[],
    birthDate: {
      dateTime: string
    },
    email: string,
    mobilePhone: string,
    photo: string,
    login: string,
    room: string,
    hisAdtId: string,
    careProviderIds: string,
    careProviders: string,
    cpf: string
}