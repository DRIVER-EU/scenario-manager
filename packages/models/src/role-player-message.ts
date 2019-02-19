export enum RolePlayerMessageType {
  CALL,
  ACTION,
  MESSAGE,
  MAIL,
  TWEET,
}

export enum RolePlayState {
  SCHEDULED,
  ON_HOLD,
  IN_PROGRESS,
  EXECUTED,
  CANCELLED,
  TIMEOUT,
}

export interface IRolePlayerMessage {
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

/**
 * Specifies a role play message
 */
export interface ITestbedRolePlayerMessage {
  /** The unique ID of the message */
  id: string;
  /** The type of role play. */
  type: RolePlayerMessageType;
  /** The title of the role play message. */
  title: string;
  /** The headline of the role play message. */
  headline: string;
  /** The description of the role play message. */
  description: string;
  /** The name of the person that has to handle the message. */
  rolePlayerName: string;
  /** The names of the person that have to receive the message. */
  participantNames?: string[];
  /** The current role play state. */
  state: RolePlayState;
  /** An optional comment to the session state. */
  comment?: string;
}

/** Convert a IRolePlayerMessage, as used in the Trial Manager, to a Test-bed ITestbedRolePlayerMessage */
export const rolePlayerMessageToTestbed = (
  rpm: IRolePlayerMessage,
  state: RolePlayState,
  rolePlayerName: string,
  participantsName?: string[]
) => ({
  id: rpm.id,
  type: rpm.type,
  title: rpm.title,
  headline: rpm.headline,
  description: rpm.description,
  rolePlayerName,
  participantsName,
  state,
});
