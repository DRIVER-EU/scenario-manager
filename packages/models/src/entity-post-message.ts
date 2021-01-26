import { IPost } from 'test-bed-schemas';
import { render } from './utils/slimdown';

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
  /**
   * The recipients' IDs assigned to the message
   * E.g. use Hein Kluiver<hein@driver.com> to display Hein Kluiver in the email client
   */
  recipientIds?: string[];
  /** Attachment or images */
  attachments?: Array<string | number>;
}

/** Convert a IRolePlayerMessage, as used in the Trial Manager, to a Test-bed ITestbedRolePlayerMessage */
export const postMessageToTestbed = (
  pm: IPostMsg,
  senderName: string,
  recipients: string[],
  date: Date,
  attachments?: Record<string, string>
) =>
  ({
    id: pm.id,
    body: render(pm.description || ''),
    header: {
      from: senderName,
      to: recipients,
      date: date.valueOf(),
      subject: pm.title,
      attachments,
    },
    name: pm.title,
    type: pm.type || 'mail',
    owner: 'TB-TrialMgmt',
    timestamp: Date.now(),
  } as IPost);
