export enum UserRole {
  // OWNER = 'OWNER',
  /** An admin can do anything */
  ADMIN = 0,
  /** An editor can edit, but not start a scenario */
  EDITOR = 1,
  /** An stakeholder can edit objectives */
  STAKEHOLDER = 2,
  /** A role player can edit the tasks he is assigned too (set completion level) */
  ROLE_PLAYER = 3,
  /** A viewer is all the others */
  VIEWER = 4,
  /** A participant in the trial */
  PARTICIPANT = 5,
}
