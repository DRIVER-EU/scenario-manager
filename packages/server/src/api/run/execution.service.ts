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
  IRequestMove,
  IAffectedArea,
  ISumoConfiguration,
  IValueNamePair,
  ILargeDataUpdate,
  IPostMsg,
  postMessageToTestbed,
} from '../../../../models';
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
      case MessageType.CHECKPOINT:
      case MessageType.ROLE_PLAYER_MESSAGE:
        this.sendRolePlayerMessage(i, comment);
        break;
      case MessageType.POST_MESSAGE:
        this.sendPostMessage(i);
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
      case MessageType.LARGE_DATA_UPDATE:
        this.sendLargeDataUpdateMessage(i, comment);
        break;
      case MessageType.REQUEST_UNIT_MOVE:
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
          `${MessageType[messageType]} is not yet supported by the execution service.`,
        );
    }
  }

  private async sendGeoJSON(i: IInject) {
    const message = getMessage<IGeoJsonMessage>(i, MessageType.GEOJSON_MESSAGE);
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
        (p) =>
          ({
            valueName: p.valueName,
            value: p.valueName[0] !== '_' ? parse(p.value) : p.value,
          } as IValueNamePair),
      );
      message.info = info;
    }
    const cap = convertCAPtoAVRO(
      message,
      new Date(this.kafkaService.timeMessage.simulationTime),
    );
    this.kafkaService.sendMessage(cap, topic);
  }

  private async sendCAP(i: IInject) {
    const message = getMessage<IAlert>(i, MessageType.CAP_MESSAGE);
    const topic = 'standard_cap';
    const cap = convertCAPtoAVRO(
      message,
      new Date(this.kafkaService.timeMessage.simulationTime),
    );
    this.kafkaService.sendMessage(cap, topic);
  }

  private async sendPostMessage(i: IInject) {
    const post = getMessage<IPostMsg>(i, MessageType.POST_MESSAGE);
    const topic = 'simulation_entity_post';
    const sender = this.trial.users
      .filter((u) => u.id === post.senderId)
      .shift();
    if (!sender) {
      console.error(`POST without sender - skipping inject ${i.title}!`);
      return;
    }
    const recipients = post.recipientIds
      ? this.trial.users
          .filter((u) => u.email && post.recipientIds.indexOf(u.id) >= 0)
          .map((u) => `${u.name}<${u.email}>`)
      : [];

    const assets =
      post.attachments &&
      (await Promise.all(
        post.attachments.map((id) =>
          this.trialService.getAsset(this.trial.id, id),
        ),
      ));
    const encodedAssets =
      assets &&
      assets.reduce((acc, cur) => {
        const base64encoded = Buffer.from(cur.data.toString()).toString(
          'base64',
        );
        acc[base64encoded] = cur.mimetype;
        return acc;
      }, {} as Record<string, string>);
    const senderName = `${sender.name}<${sender.email}>`;
    const postMsg = postMessageToTestbed(
      post,
      senderName,
      recipients,
      this.kafkaService.simulationTime,
      encodedAssets,
    );
    this.kafkaService.sendMessage(postMsg, topic);
  }

  private async sendRolePlayerMessage(i: IInject, comment?: string) {
    const rpm = getMessage<IRolePlayerMsg>(i, MessageType.ROLE_PLAYER_MESSAGE);
    const rolePlayer = this.trial.users
      .filter((u) => u.id === rpm.rolePlayerId)
      .shift();
    const rolePlayerName = rolePlayer ? rolePlayer.name : 'Unknown';
    const participants = rpm.participantIds
      ? this.trial.users
          .filter((u) => rpm.participantIds.indexOf(u.id) >= 0)
          .map((u) => u.name)
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
    const msg = getMessage<IOstStageChangeMessage>(
      i,
      MessageType.CHANGE_OBSERVER_QUESTIONNAIRES,
    );
    this.kafkaService.sendOstStageChangeRequestMessage(msg);
  }

  private async sendStartInjectMessage(i: IInject, comment?: string) {
    const msg = getMessage<IRequestStartInject>(i, MessageType.START_INJECT);
    this.kafkaService.sendStartInjectMessage(msg);
  }

  private async sendLargeDataUpdateMessage(i: IInject, comment?: string) {
    const msg = getMessage<ILargeDataUpdate>(i, MessageType.LARGE_DATA_UPDATE);
    this.kafkaService.sendLargeDataUpdateMessage(msg);
  }

  private async sendRequestUnitTransport(i: IInject, comment?: string) {
    const msg = getMessage<IRequestMove>(i, MessageType.REQUEST_UNIT_MOVE);
    this.kafkaService.sendRequestUnitTransport(msg);
  }

  private async sendSetAffectedArea(i: IInject, comment?: string) {
    const msg = getMessage<IAffectedArea>(i, MessageType.SET_AFFECTED_AREA);
    this.kafkaService.sendSetAffectedArea(msg);
  }

  private async sendSumoConfiguration(i: IInject, comment?: string) {
    const msg = getMessage<ISumoConfiguration>(
      i,
      MessageType.SUMO_CONFIGURATION,
    );
    this.kafkaService.sendSumoConfiguration(msg);
  }

  /** Find the topic that should be used for publishing. */
  private findTopic(messageType: MessageType, subjectId: string) {
    if (!this.trial.messageTopics) {
      return;
    }
    const mt = this.trial.messageTopics
      .filter((t) => t.messageType === messageType)
      .shift();
    if (!mt || !mt.topics) {
      return;
    }
    const topic = mt.topics.filter((t) => t.id === subjectId).shift();
    return topic && topic.topic ? topic.topic : undefined;
  }
}
