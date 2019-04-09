import * as fs from 'fs';
import {
  LogLevel,
  ITestBedOptions,
  RequestChangeOfTrialStage,
  TrialManagementPhaseMessageTopic,
  TrialManagementRolePlayerTopic,
  TrialManagementSessionMgmtTopic,
} from 'node-test-bed-adapter';

export default {
  kafkaHost: process.env.KAFKA_HOST || 'driver-testbed.eu:3541',
  schemaRegistry: process.env.SCHEMA_REGISTRY || 'driver-testbed.eu:3542',
  // kafkaHost: 'driver-testbed.eu:3501',
  // schemaRegistry: 'driver-testbed.eu:3502',
  // sslOptions: {
  //   pfx: fs.readFileSync('certs/TB-TrialMgmt.p12'),
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
    // 'standard_geojson',
    // 'standard_named_geojson',
  ],
  logging: {
    logToConsole: LogLevel.Debug,
    logToKafka: LogLevel.Warn,
  },
} as ITestBedOptions;
