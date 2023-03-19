// import tbs from 'test-bed-schemas';
// const tbs = import('test-bed-schemas');
import { Type as RolePlayerMessageType, IRolePlayerMessage } from 'test-bed-schemas';

export interface IRolePlayerMsg {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Type of role player action */
  type: RolePlayerMessageType;
  /** Same as the inject title */
  title: string;
  /** Same as the inject description */
  headline?: string;
  /** Message body */
  description?: string;
  /** The role player's ID assigned to perform the role */
  rolePlayerId?: string;
  /** The partipants' IDs assigned to the message */
  participantIds?: string[];
  /** Attachment or images */
  urls?: Array<{ href: string; name: string; size: number }>;
}

/** Convert a IRolePlayerMessage, as used in the Trial Manager, to a Test-bed ITestbedRolePlayerMessage */
export const rolePlayerMessageToTestbed = (
  rpm: IRolePlayerMsg,
  rolePlayerName: string = 'UNDEFINED',
  participantNames?: string[],
  comment = ''
) =>
  ({
    id: rpm.id,
    type: rpm.type || RolePlayerMessageType.ACTION,
    title: rpm.title || '',
    headline: rpm.headline || '',
    description: rpm.description || '',
    rolePlayerName,
    participantNames,
    comment,
  } as IRolePlayerMessage);
