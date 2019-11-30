import { IPost, MediumTypes } from './messages';

export interface IPostMsg {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Type of role player action */
  type: MediumTypes;
  /** Same as the inject title */
  title: string;
  /** Message body */
  description?: string;
  /** The sender's ID assigned to perform the role */
  senderId?: string;
  /** The recipients' IDs assigned to the message */
  recipientIds?: string[];
  /** Attachment or images */
  urls?: Array<{ href: string; name: string; size: number }>;
}

/** Convert a IRolePlayerMessage, as used in the Trial Manager, to a Test-bed ITestbedRolePlayerMessage */
export const postMessageToTestbed = (pm: IPostMsg, senderName: string, recipients: string[], date: Date) =>
  ({
    guid: pm.id,
    name: pm.title,
    senderName,
    owner: '',
    mediumType: pm.type || MediumTypes.MAIL,
    mediumName: '',
    header: pm.title,
    body: pm.description,
    recipients,
    date: date.valueOf(),
    visibleForParticipant: true,
  } as IPost);
