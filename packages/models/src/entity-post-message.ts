import { IPost } from 'test-bed-schemas';

export interface IPostMsg {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Type of role player action */
  type: string;
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
    id: pm.id,
    body: pm.description,
    header: {
      from: senderName,
      to: recipients,
      date: date.valueOf(),
      subject: pm.title,
    },
    name: pm.title,
    type: pm.type || 'mail',
    owner: 'TB-TrialMgmt',
    timestamp: Date.now(),
  } as IPost);
