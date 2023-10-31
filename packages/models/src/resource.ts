export enum ResourceType {
  OTHER = 0,
  VEHICLE = 1,
  PLANE = 2,
  BOAT = 3,
  GENERATOR = 4,
}

/** A resource that is used in a script, e.g. a truck */
export type Resource = {
  id: string;
  name: string;
  desc?: string;
  type: ResourceType;
  properties?: { [key: string]: string | number | boolean | undefined }
}
