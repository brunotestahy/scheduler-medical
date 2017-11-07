// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  baseURL: 'https://10.25.44.2:8459/schedule',
  his: 'source:copastar',
  roomMapping: 'rdsl:model:map:room:buildingsector',
  kafka: {
    'metadata.broker.list': 'localhost:9092',
    'security.protocol': 'plaintext'
  },
  mappings: {
    'roomToSectorMap': 'rdsl:model:map:room:buildingsector:copastar',
    'scheduleCategorySet': 'rdsl:model:set:appointment:type',
    'scheduleTypeSet': 'rrdsl:model:set:appointment:category',
  },
  appointment: {
    baseURL: '/api/appointment',
    categoryUrl: '/category',
    appointmentUrl: '/',
    typeUrl: '/type',
    patientUrl: '/patient',
    paginationURL: '/paginate'

  },
  conceptmap: {
    baseURL: '/api/conceptmap'
  },
  appointmentList: {
    baseURL: '/api/appointmentlist',
    patientUrl: '/patient',
  },
  patient: {
    baseURL: '/api/patient',
    patientUrl: '/',
    hisURL: '/his',
    admittedURL: '/his/admitted',
    searchURL: '/search',
    searchPaginatedURL: '/search/paginated',
    paginationURL: '/paginate'
  },
  login: {
    ldapURL: '/users/login',
    smartURL: '/users/login/smart',
    meURL: '/api/users/me',
    authType: 'SMART'
  },
  log: {
    baseURL: '/api/log',
    bulkSaveURL: '/bulksave',
    bulkRetry: 5,
    loggingInterval: 15000
  },
  room: {
    baseURL: '/api/room',
    sectorURL: '/sector'
  },
  identification: {
    baseURL: 'https://10.25.44.129:8459/identification',
    patientURL: '/api/patient',
    careProvidersURL: '/careProviders'
  }};
