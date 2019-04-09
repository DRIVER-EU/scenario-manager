// import * as fs from 'fs';
import {
  LogLevel,
  ITestBedOptions,
  RequestChangeOfTrialStage,
  TrialManagementPhaseMessageTopic,
  TrialManagementRolePlayerTopic,
  TrialManagementSessionMgmtTopic,
} from 'node-test-bed-adapter';

export default {
  kafkaHost: process.env.KAFKA_HOST || 'localhost:3501',
  schemaRegistry: process.env.SCHEMA_REGISTRY || 'localhost:3502',
  // kafkaHost: 'driver-testbed.eu:3501',
  // schemaRegistry: 'driver-testbed.eu:3502',
  // sslOptions: {
  //   pfx: fs.readFileSync('certs/other-tool-1-client.p12'),
  //   passphrase: 'changeit',
  //   ca: fs.readFileSync('certs/test-ca.pem'),
  //   rejectUnauthorized: true,
  // },
  clientId: 'TB-TrialMgmt',
  fetchAllSchemas: false,
  fetchAllVersions: false,
  // autoRegisterSchemas: true,
  autoRegisterSchemas: false,
  wrapUnions: 'auto',
  schemaFolder: './data/schemas',
  // consume: [],
  produce: [
    RequestChangeOfTrialStage,
    TrialManagementPhaseMessageTopic,
    TrialManagementRolePlayerTopic,
    TrialManagementSessionMgmtTopic,
    'system_tm_session_mgmt',
    'standard_cap',
    'standard_geojson',
    'standard_named_geojson',
  ],
  logging: {
    logToConsole: LogLevel.Info,
    logToKafka: LogLevel.Warn,
  },
} as ITestBedOptions;
