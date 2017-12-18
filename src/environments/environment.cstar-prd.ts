// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const scheduleServer = 'https://hcssmart01.rededor.corp/schedule_server';
const identificationServer = 'https://rdhcssmarthml01.rededor.corp/identification_server';

export const environment = {
  production: false,
  baseURL: `${scheduleServer}`,
  his: 'source:copastar',
  roomMapping: 'rdsl:model:map:room:buiydingsector',
  homeRoute: '/practitioner/patients',
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
    baseURL: `${scheduleServer}/api/appointment`,
    categoryUrl: '/category',
    appointmentUrl: '/',
    typeUrl: '/type',
    patientUrl: '/patient',
    paginationURL: '/paginate',
    shiftURL: '/shift'
  },
  careplan: {
    baseURL: `${scheduleServer}/api/careplan`,
    patientUrl: '/patient/latest',
    activityCategoryUrl: '/activity/category',
    activityTypeUrl: '/activity/type',
  },
  conceptmap: {
    baseURL: `${scheduleServer}/api/conceptmap`
  },
  appointmentList: {
    baseURL: `${scheduleServer}/api/appointmentlist`,
    patientUrl: '/patient',
  },
  patient: {
    baseURL: `${identificationServer}/api/patient`,
    careProvidersURL: '/careProviders'
  },
  patientSchedule: {
    baseURL: `${scheduleServer}/api/patient`,
    patientUrl: '/',
    hisURL: '/his',
    admittedURL: '/his/admitted',
    searchURL: '/search',
    searchPaginatedURL: '/search/paginated',
    paginationURL: '/paginate',
    careProvidersURL: '/careProviders'
  },
  login: {
    authType: 'SMART',
    baseURL: `${scheduleServer}`,
    ldapURL: '/users/login',
    smartURL: '/users/login',
    meURL: '/api/users/me'
  },
  log: {
    baseURL: `${scheduleServer}/api/log`,
    bulkSaveURL: '/bulksave',
    bulkRetry: 5,
    loggingInterval: 15000
  },
  room: {
    baseURL: `${scheduleServer}/api/room`,
    sectorURL: '/sector'
  },
  identification: {
    baseURL: identificationServer,
    patientURL: '/api/patient',
    careProvidersURL: '/careProviders'
  },
  carePlanPage: 'https://hcssmart01.rededor.corp/careplan',
  smartPage: 'https://hcssmart01.rededor.corp/smart/public/index.html',
  identificationPage: 'https://hcssmart01.rededor.corp/identification'
};


