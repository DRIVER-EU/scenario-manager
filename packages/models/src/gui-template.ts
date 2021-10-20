export interface IGuiTemplate {
  /** Label to be used in the TMT interface */
  label: string;
  /** Icon name, from the material-icons library */
  icon: string;
  /** Topic name, will be added after importing */
  topic: string;
  /** UI Form template or string */
  ui: string | Array<Record<string, any>>;
  /** Inject properties that must be updated after each model update. */
  update?: Record<string, string>;
}
