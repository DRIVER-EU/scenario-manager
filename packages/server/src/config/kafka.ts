import * as fs from 'fs';
import {
  LogLevel,
  ITestBedOptions,
  RequestChangeOfTrialStage,
  TrialManagementPhaseMessageTopic,
  TrialManagementRolePlayerTopic,
  TrialManagementSessionMgmtTopic,
} from 'node-test-bed-adapter';

export default () => ({
  kafka: {
    kafkaHost: process.env.KAFKA_HOST || 'localhost:3501',
    schemaRegistry: process.env.SCHEMA_REGISTRY || 'localhost:3502',
    // kafkaHost: process.env.KAFKA_HOST || 'tb3.driver-testbed.eu:3531',
    // schemaRegistry: process.env.SCHEMA_REGISTRY || 'tb3.driver-testbed.eu:3532',
    // kafkaHost: process.env.KAFKA_HOST || 'tb4.driver-testbed.eu:3541',
    // schemaRegistry: process.env.SCHEMA_REGISTRY || 'tb4.driver-testbed.eu:3542',
    // kafkaHost: process.env.KAFKA_HOST || 'tb5.driver-testbed.eu:3551',
    // schemaRegistry: process.env.SCHEMA_REGISTRY || 'tb5.driver-testbed.eu:3552',
    // kafkaHost: 'driver-testbed.eu:3501',
    // schemaRegistry: 'driver-testbed.eu:3502',
    // sslOptions: true // process.env.SSL === 'true'
    sslOptions: process.env.SSL === 'true'
      ? {
        pfx: fs.readFileSync(process.env.SSL_PFX || 'certs/TB-TrialMgmt.p12'),
        passphrase: process.env.SSL_PASSPHRASE || 'changeit',
        ca: fs.readFileSync(process.env.SSL_CA || 'certs/test-ca.pem'),
        rejectUnauthorized: true,
      }
      : undefined,
    clientId: process.env.CLIENT_ID || 'TB-TrialMgmt',
    fetchAllSchemas: false,
    fetchAllVersions: false,
    // autoRegisterSchemas: true,
    autoRegisterSchemas: true,
    wrapUnions: 'auto',
    schemaFolder: '../../docker/schemas',
    // consume: [],
    produce: process.env.PRODUCE
      ? process.env.PRODUCE.split(',')
      : [
        RequestChangeOfTrialStage,
        TrialManagementPhaseMessageTopic,
        TrialManagementRolePlayerTopic,
        TrialManagementSessionMgmtTopic,
        // 'flood_prediction_geojson',
        'standard_cap',
        'simulation_entity_post',
        'send_file',
        'named_json',
        // 'standard_geojson',
        // 'large_data_update',
        'simulation_request_startinject',
        // 'sumo_SumoConfiguration',
        // 'sumo_AffectedArea',
        // 'simulation_request_unittransport',
        // 'standard_named_geojson',
      ],
    logging: {
      logToConsole: LogLevel.Debug,
      logToKafka: LogLevel.Warn,
    },
  } as ITestBedOptions,
});
