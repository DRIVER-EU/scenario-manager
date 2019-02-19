// import * as fs from 'fs';
import { LogLevel, ITestBedOptions } from 'node-test-bed-adapter';

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
  clientId: 'TrialManager',
  fetchAllSchemas: false,
  fetchAllVersions: false,
  // autoRegisterSchemas: true,
  autoRegisterSchemas: false,
  wrapUnions: 'auto',
  schemaFolder: './data/schemas',
  // consume: [],
  produce: ['system_request_change_of_trial_stage', 'phase_message', 'role_player', 'session_mgmt'],
  logging: {
    logToConsole: LogLevel.Info,
    logToKafka: LogLevel.Warn,
  },
} as ITestBedOptions;
