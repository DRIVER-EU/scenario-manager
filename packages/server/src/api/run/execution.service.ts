import { Injectable, Inject } from '@nestjs/common';
import {
  ITrial,
  IInject,
  MessageType,
  getMessage,
  geojsonToAvro,
  mapToAvro,
  IGeoJsonMessage,
  InjectState,
  rolePlayerMessageToTestbed,
  IRolePlayerMsg,
  IExecutionService,
  IPhaseMessage,
  IOstStageChangeMessage,
  IAlert,
  convertCAPtoAVRO,
  IRequestStartInject,
  IRequestUnitTransport,
  IAffectedArea,
  ISumoConfiguration,
  IValueNamePair,
} from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';
import { TrialService } from '../trials/trial.service';
import { parse } from '../../utils';

@Injectable()
export class ExecutionService implements IExecutionService {
  private trial: ITrial;

  constructor(
    @Inject('KafkaService') private readonly kafkaService: KafkaService,
    @Inject('TrialService') private readonly trialService: TrialService,
  ) {}

  public init(trial: ITrial) {
    this.trial = trial;
  }

  public execute(i: IInject, _state = InjectState.EXECUTED, comment?: string) {
    const { messageType } = i;
    switch (messageType) {
      case MessageType.GEOJSON_MESSAGE:
        this.sendGeoJSON(i);
        break;
      case MessageType.LCMS_MESSAGE:
        this.sendLCMS(i);
        break;
      case MessageType.CAP_MESSAGE:
        this.sendCAP(i);
        break;
      case MessageType.ROLE_PLAYER_MESSAGE:
        this.sendRolePlayerMessage(i, comment);
        break;
      case MessageType.PHASE_MESSAGE:
        this.sendPhaseMessage(i, comment);
        break;
      case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
        this.sendChangeObserverQuestionnairesMessage(i, comment);
        break;
      case MessageType.START_INJECT:
        this.sendStartInjectMessage(i, comment);
        break;
      case MessageType.REQUEST_UNIT_TRANSPORT:
        this.sendRequestUnitTransport(i, comment);
        break;
      case MessageType.SET_AFFECTED_AREA:
        this.sendSetAffectedArea(i, comment);
        break;
      case MessageType.SUMO_CONFIGURATION:
        this.sendSumoConfiguration(i, comment);
        break;
      default:
        console.warn(
          `${
            MessageType[messageType]
          } is not yet supported by the execution service.`,
        );
    }
  }

  private async sendGeoJSON(i: IInject) {
    const message = getMessage(
      i,
      MessageType.GEOJSON_MESSAGE,
    ) as IGeoJsonMessage;
    const topic = this.findTopic(
      MessageType.GEOJSON_MESSAGE,
      message.subjectId,
    );
    if (!topic) {
      return console.warn(
        `Could not send message (${i.title}) - no topic configured`,
      );
    }
    const asset = await this.trialService.getAsset(
      this.trial.id,
      message.assetId,
    );
    if (!asset) {
      return console.warn(`Could not open asset with ID (${message.assetId})`);
    }
    const geojson = geojsonToAvro(JSON.parse(asset.data.toString()));
    const msg = message.properties
      ? { geojson, properties: mapToAvro(message.properties) }
      : geojson;
    this.kafkaService.sendMessage(msg, topic);
  }

  private async sendLCMS(i: IInject) {
    const message = getMessage<IAlert>(i, MessageType.CAP_MESSAGE);
    const topic = 'standard_cap';
    if (message.info) {
      const info =
        message.info instanceof Array ? message.info[0] : message.info;
      const parameters =
        info.parameter instanceof Array ? info.parameter : [info.parameter];
      info.parameter = parameters.map(
        p =>
          ({
            valueName: p.valueName,
            value: parse(p.value),
          } as IValueNamePair),
      );
      message.info = info;
    }
    const cap = convertCAPtoAVRO(
      message,
      new Date(this.kafkaService.timeMessage.trialTime),
    );
    this.kafkaService.sendMessage(cap, topic);
  }

  private async sendCAP(i: IInject) {
    const message = getMessage<IAlert>(i, MessageType.CAP_MESSAGE);
    const topic = 'standard_cap';
    const cap = convertCAPtoAVRO(
      message,
      new Date(this.kafkaService.timeMessage.trialTime),
    );
    this.kafkaService.sendMessage(cap, topic);
  }

  private async sendRolePlayerMessage(i: IInject, comment?: string) {
    const rpm = getMessage(
      i,
      MessageType.ROLE_PLAYER_MESSAGE,
    ) as IRolePlayerMsg;
    const rolePlayer = this.trial.users
      .filter(u => u.id === rpm.rolePlayerId)
      .shift();
    const rolePlayerName = rolePlayer ? rolePlayer.name : 'Unknown';
    const participants = rpm.participantIds
      ? this.trial.users
          .filter(u => rpm.participantIds.indexOf(u.id) >= 0)
          .map(u => u.name)
      : [];
    const msg = rolePlayerMessageToTestbed(
      rpm,
      rolePlayerName,
      participants,
      comment,
    );
    this.kafkaService.sendRolePlayerMessage(msg);
  }

  private async sendPhaseMessage(i: IInject, comment?: string) {
    const msg = getMessage(i, MessageType.PHASE_MESSAGE) as IPhaseMessage;
    this.kafkaService.sendPhaseMessage(msg);
  }

  private async sendChangeObserverQuestionnairesMessage(
    i: IInject,
    comment?: string,
  ) {
    const msg = getMessage(
      i,
      MessageType.CHANGE_OBSERVER_QUESTIONNAIRES,
    ) as IOstStageChangeMessage;
    this.kafkaService.sendOstStageChangeRequestMessage(msg);
  }

  private async sendStartInjectMessage(i: IInject, comment?: string) {
    const msg = getMessage(i, MessageType.START_INJECT) as IRequestStartInject;
    this.kafkaService.sendStartInjectMessage(msg);
  }

  private async sendRequestUnitTransport(i: IInject, comment?: string) {
    const msg = getMessage(
      i,
      MessageType.REQUEST_UNIT_TRANSPORT,
    ) as IRequestUnitTransport;
    this.kafkaService.sendRequestUnitTransport(msg);
  }

  private async sendSetAffectedArea(i: IInject, comment?: string) {
    const msg = getMessage(i, MessageType.SET_AFFECTED_AREA) as IAffectedArea;
    this.kafkaService.sendSetAffectedArea(msg);
  }

  private async sendSumoConfiguration(i: IInject, comment?: string) {
    const msg = getMessage(
      i,
      MessageType.SUMO_CONFIGURATION,
    ) as ISumoConfiguration;
    this.kafkaService.sendSumoConfiguration(msg);
  }

  /** Find the topic that should be used for publishing. */
  private findTopic(messageType: MessageType, subjectId: string) {
    if (!this.trial.messageTopics) {
      return;
    }
    const mt = this.trial.messageTopics
      .filter(t => t.messageType === messageType)
      .shift();
    if (!mt || !mt.topics) {
      return;
    }
    const topic = mt.topics.filter(t => t.id === subjectId).shift();
    return topic && topic.topic ? topic.topic : undefined;
  }
}
