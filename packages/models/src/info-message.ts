export declare enum InfoMsgType {
  BILLBOARD = 'BILLBOARD',
  TV_BROADCAST = 'TV_BROADCAST',
  RADIO_BROADCAST = 'RADIO_BROADCAST',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

/**
 * This is an informative message that can be shown instead of the clock and calendar on the time service, or somewhere else.
 */
export type InfoMsg = {
  /** The unique ID of the message */
  id: string;
  /** The type of role play. */
  type: InfoMsgType;
  /** The title of the role play message. */
  title: string;
  /** The headline of the role play message. */
  headline: string;
  /** The longer description of the role play message. */
  description: string;
  /** The filename of the message that needs to be displayed. */
  filename?: string;
  /** An optional comment to the session state. */
  comment?: null | undefined | string;
};
