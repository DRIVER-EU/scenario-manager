import { Repository, ObjectID, FindOneOptions, ObjectLiteral, FindManyOptions, FindConditions, SaveOptions } from 'typeorm';

export interface IMockEntity extends ObjectLiteral {
  id: string | ObjectID;
}

export class MockRepository<T extends IMockEntity> extends Repository<T> {
  private store: T[] = [];
  private id = 0;

  constructor() {
    super();
  }

  get uuid() {
    const u = this.id.toString();
    this.id++;
    return u;
  }

  findOne(options?: FindOneOptions<T>): Promise<T | undefined>;
  findOne(id?: FindConditions<T> | string | number | Date | ObjectID, options?: FindOneOptions<T>): Promise<T | undefined>;
  findOne(id?: FindOneOptions<T> | FindConditions<T> | string | number | Date | ObjectID, options?: FindOneOptions<T>): Promise<T | undefined> {
    return new Promise<T | undefined>(resolve => resolve(this.store.filter((e: T) => e.id === id).shift()));
  }

  find(_options?: FindConditions<T> | FindManyOptions<T>) {
    return new Promise<T[]>(resolve => resolve(this.store));
  }

  // save<T extends DeepPartial<Entity>>(entities: T[], options?: SaveOptions): Promise<T[]>;
  /**
   * Saves a given entity in the database.
   * If entity does not exist in the database then inserts, otherwise updates.
   */
  save(entity: T, options?: SaveOptions): Promise<T>;
  save(entities: T[], options?: SaveOptions): Promise<T[]>;
  save(entities: T | T[], options?: SaveOptions): Promise<T | T[]> {
    return new Promise<T | T[]>(resolve => {
      const addId = (e: T) => Object.assign(e, { id: this.uuid });
      if (entities instanceof Array) {
        const newEntities = entities.map(addId);
        this.store.push(...newEntities);
        resolve(newEntities);
      } else {
        const newEntity = addId(entities);
        this.store.push(newEntity);
        resolve(newEntity);
      }
    });
  }
}
