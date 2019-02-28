import { Injectable, Inject } from '@nestjs/common';
import {
  ITrial,
  IInject,
  MessageType,
  getMessage,
  geojsonToAvro,
  mapToAvro,
  IGeoJsonMessage,
} from 'trial-manager-models';
import { KafkaService } from '../../adapters/kafka';
import { TrialService } from '../trials/trial.service';

@Injectable()
export class ExecutionService {
  private trial: ITrial;

  constructor(
    @Inject('KafkaService') private readonly kafkaService: KafkaService,
    @Inject('TrialService') private readonly trialService: TrialService,
  ) {}

  public init(trial: ITrial) {
    this.trial = trial;
  }

  public execute(i: IInject) {
    const { messageType } = i;
    switch (messageType) {
      case MessageType.GEOJSON_MESSAGE:
        this.sendGeoJSON(i);
      default:
        console.warn(
          `${messageType} is not yet supported by the execution service.`,
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
