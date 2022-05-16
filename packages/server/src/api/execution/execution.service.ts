import { Injectable } from '@nestjs/common';
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
  ISendFileMessage,
  IFeatureCollection,
  ISendMessageMessage,
} from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';
import { TrialService } from '../trials/trial.service';
import { parse } from '../../utils';
import { IFeature } from 'node-test-bed-adapter';

@Injectable()
export class ExecutionService implements IExecutionService {
  private trial: ITrial;

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly trialService: TrialService,
  ) {}

  public init(trial: ITrial) {
    this.trial = trial;
  }

  public execute(i: IInject, _state = InjectState.EXECUTED, comment?: string) {
    let { messageType } = i;
    if (!messageType && i.selectedMessage && i.selectedMessage.messageType) {
      messageType = i.selectedMessage.messageType;
    }
    switch (messageType) {
      case MessageType.SEND_MESSAGE:
        this.sendMessage(i);
        break;
      case MessageType.SEND_FILE:
        this.sendFile(i);
        break;
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
        this.sendDefaultMessage(i);
    }
  }

  private sendDefaultMessage(i: IInject) {
    const data = i.message[i.messageType];
    const topic = i.kafkaTopic;
    this.kafkaService.sendMessage(data, topic);
  }

  private async sendMessage(i: IInject) {
    const message = getMessage<ISendMessageMessage>(
      i,
      MessageType.SEND_MESSAGE,
    );

    let topic: string;
    if (i.kafkaTopic !== 'send_message') {
      topic = i.kafkaTopic;
    }
    if (!topic) {
      topic = message.kafkaTopicId;
      if (!topic) {
        return console.warn(`There is no topic set`);
      }
    }

    let data = message.message;

    if (i.selectedMessage && i.selectedMessage.useNamespace) {
      data = this.prepareGeoJSON(data, i.selectedMessage.namespace);
    } else {
      data = JSON.parse(data);
      this.kafkaService.sendMessage(data, topic);
    }
  }

  private async sendFile(i: IInject) {
    const message = getMessage<ISendFileMessage>(i, MessageType.SEND_FILE);

    let topic: string;
    // If the kafkaTopic is not send_file, take the topic from the kafkaTopic
    if (i.kafkaTopic !== 'send_file') {
      topic = i.kafkaTopic;
    }
    // else, take the kafkaTopic from the message
    else {
      topic = message.kafkaTopicId;
      if (!topic) {
        return console.warn(`There is no topic set`);
      }
    }
    const asset =
      message.file &&
      (await this.trialService.getAsset(this.trial.id, message.file));

    if (!asset) {
      return console.warn(`Could not open asset with ID (${message.file})`);
    } else {
      let data = asset.data.toString();

      // If the message uses namespaces, add them here
      if (i.selectedMessage && i.selectedMessage.useNamespace) {
        data = this.prepareGeoJSON(data, i.selectedMessage.namespace);
      }

      // If the topic is a named_json, make sure to send it accordingly
      if (topic === 'named_json') {
        this.kafkaService.sendMessage(
          { name: asset.filename, json_string: data },
          topic,
        );
      }
      // else simply parse the data and send it to the selected kafka topic
      else {
        data = JSON.parse(data);
        this.kafkaService.sendMessage(data, topic);
      }
    }
  }

  private async sendGeoJSON(i: IInject) {
    const message = getMessage<IGeoJsonMessage>(i, MessageType.GEOJSON_MESSAGE);
    const { topic } = i;
    // const topic = this.findTopic(
    //   MessageType.GEOJSON_MESSAGE,
    //   message.subjectId,
    // );
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
    post.id = i.id;
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
        acc[cur.filename] = `data:${cur.mimetype};base64,${cur.data.toString(
          'base64',
        )}`;
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
    msg.id = i.id;
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

  // /** Find the topic that should be used for publishing. */
  // private findTopic(messageType: MessageType, subjectId: string) {
  //   if (!this.trial.messageTopics) {
  //     return;
  //   }
  //   const mt = this.trial.messageTopics
  //     .filter((t) => t.topic === messageType)
  //     .shift();
  //   if (!mt || !mt.topics) {
  //     return;
  //   }
  //   const topic = mt.topics.filter((t) => t.id === subjectId).shift();
  //   return topic && topic.topic ? topic.topic : undefined;
  // }

  private prepareGeoJSON(data: string, namespace: string) {
    const obj = JSON.parse(data);
    if (obj.type && obj.type === 'FeatureCollection') {
      obj.features &&
        obj.features.forEach((ft: any) => {
          const namespaceName = (namespace + '.' + ft.geometry.type) as string;
          ft.geometry = { [namespaceName]: ft.geometry };
        });
    } else if (obj.type && obj.type === 'Feature') {
      const namespaceName = (namespace + '.' + obj.geometry.type) as string;
      obj.geometry = { [namespaceName]: obj.geometry };
    }

    return JSON.stringify(obj);
  }
}
