import * as fs from 'fs';
import * as path from 'path';
import { Database } from 'sqlite3';
import { ScenarioOverview, IUploadedFile } from '../../models';
import { uuid4, logError } from '../../utils';

const SCENARIO = 'scenario';
const EXT = '.sqlite3';
const ASSETS = 'asset';

const sortScenarioByLastEdit = (a: ScenarioOverview, b: ScenarioOverview) =>
  a.lastEdit > b.lastEdit ? -1 : 1;

export class ScenarioRepository {
  private databases: { [id: string]: { db: Database; filename: string } } = {};
  private overview: ScenarioOverview[] = [];

  constructor(private folder: string) {
    const dbs = this.openAllDatabases();
    this.createOverview(dbs);
    this.closeAllDatabasesOnExit();
  }

  get scenarioList() {
    return this.overview;
  }

  async openScenario(id: string) {
    return this.getScenario(id);
  }

  async getScenarioFilename(id: string) {
    return new Promise<string>((resolve, reject) => {
      const dbi = this.databases.hasOwnProperty(id) ? this.databases[id] : undefined;
      if (!dbi) {
        return reject(`Error, no database with id ${id} found!`);
      }
      resolve(dbi.filename);
    });
  }

  async createScenario(scenario: ScenarioOverview) {
    scenario.id = uuid4();
    const now = new Date();
    scenario.creationDate = scenario.lastEdit = now;
    this.overview.push(new ScenarioOverview(scenario));
    this.overview.sort(sortScenarioByLastEdit);
    await this.createDb(scenario);
    return scenario;
  }

  async updateScenario(id: string, scenario: ScenarioOverview) {
    return new Promise((resolve, reject) => {
      const db = this.databases.hasOwnProperty(id)
        ? this.databases[id].db
        : null;
      if (!db) {
        reject(`Database with id ${id} does not exist!`);
      }
      const now = new Date();
      scenario.lastEdit = now;
      db.get(
        `UPDATE ${SCENARIO} SET data = ?`,
        JSON.stringify(scenario),
        err => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          this.overview = this.overview.filter(s => s.id !== id);
          this.overview.push(new ScenarioOverview(scenario));
          this.overview.sort(sortScenarioByLastEdit);
          resolve();
        },
      );
    });
  }

  async removeScenario(id: string) {
    return new Promise((resolve, reject) => {
      if (!this.databases.hasOwnProperty(id)) {
        return reject(`Error, no database with ID ${id} exists!`);
      }
      const { db, filename } = this.databases[id];
      db.close(err => {
        if (err) {
          logError(err);
          return reject(err);
        } else {
          fs.unlink(filename, err2 => {
            if (err2) {
              logError(err2);
              return reject(err2);
            }
            delete this.databases[id];
            this.overview = this.overview.filter(s => s.id !== id);
            resolve();
          });
        }
      });
    });
  }

  // Asset mgmt

  async getAsset(id: string, assetId: number | string) {
    return new Promise<{
      id: number;
      data: Uint8Array;
      mimetype: string;
      filename: string;
    }>(async (resolve, reject) => {
      const db = this.databases.hasOwnProperty(id)
        ? this.databases[id].db
        : undefined;
      if (!db) {
        return reject(`Error, no database with id ${id} found!`);
      }
      db.get(
        `SELECT id, mimetype, filename, data FROM ${ASSETS} WHERE id=?`,
        assetId,
        (
          err: Error,
          row: {
            id: number;
            mimetype: string;
            data: Uint8Array;
            filename: string;
          },
        ) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          resolve(row);
        },
      );
    });
  }

  async createAsset(id: string, file: IUploadedFile) {
    return new Promise<number>(async (resolve, reject) => {
      const db = this.databases.hasOwnProperty(id)
        ? this.databases[id].db
        : undefined;
      if (!db) {
        return reject(`Error, no database with id ${id} found!`);
      }
      function callback(err: Error) {
        if (err) {
          return reject(err);
        }
        resolve(this.lastID);
      }
      const { originalname, mimetype, buffer } = file;
      db.run(
        `INSERT INTO ${ASSETS}(filename, mimetype, data) VALUES(?, ?, ?)`,
        originalname,
        mimetype,
        buffer,
        callback,
      );
    });
  }

  async updateAsset(id: string, assetId: string | number, file: IUploadedFile) {
    return new Promise(async (resolve, reject) => {
      const db = this.databases.hasOwnProperty(id)
        ? this.databases[id].db
        : undefined;
      if (!db) {
        return reject(`Error, no database with id ${id} found!`);
      }
      const { originalname, mimetype, buffer } = file;
      db.run(
        `UPDATE ${ASSETS} SET filename = ?, mimetype = ?, data = ? WHERE id = ?`,
        originalname,
        mimetype,
        buffer,
        assetId,
        (err: Error) => {
          if (err) {
            return reject(err);
          }
          resolve();
        },
      );
    });
  }

  async removeAsset(id: string, assetId: number | string) {
    return new Promise(async (resolve, reject) => {
      const db = this.databases.hasOwnProperty(id)
        ? this.databases[id].db
        : undefined;
      if (!db) {
        return reject(`Error, no database with id ${id} found!`);
      }
      db.run(`DELETE FROM ${ASSETS} WHERE id=?`, assetId, (err: Error) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  // Private methods

  /** Get an absolute path to the SQLITE database */
  private toFilename(id: string) {
    return path.resolve(this.folder, `${SCENARIO}_${id}${EXT}`);
  }

  private async getScenario(id: string | Database) {
    return new Promise<ScenarioOverview>((resolve, reject) => {
      const db =
        typeof id === 'string'
          ? this.databases.hasOwnProperty(id)
            ? this.databases[id].db
            : null
          : id;
      if (!db) {
        reject(`Database with id ${id} does not exist!`);
      }
      db.get(`SELECT data FROM ${SCENARIO}`, (err, row) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        const scenario = JSON.parse(row.data);
        resolve(scenario);
      });
    });
  }

  private openAllDatabases() {
    const files = fs.readdirSync(this.folder);
    return files
      .filter(f => path.extname(f) === EXT)
      .map(f => path.resolve(this.folder, f))
      .reduce(
        (acc, f) => [...acc, { db: new Database(f, logError), filename: f }],
        [] as Array<{ db: Database; filename: string }>,
      );
  }

  private async createOverview(dbs: Array<{ db: Database; filename: string }>) {
    const scenarios = await Promise.all<ScenarioOverview>(
      dbs.reduce((acc, db) => {
        const scenario = this.getScenario(db.db);
        acc.push(scenario);
        return acc;
      }, []),
    );
    this.databases = scenarios.reduce((acc, s, i) => {
      acc[s.id] = dbs[i];
      return acc;
    }, {});
    scenarios.sort(sortScenarioByLastEdit);
    console.log(`${scenarios.length} scenarios loaded...`);
    this.overview = scenarios.map(s => new ScenarioOverview(s));
  }

  private async createDb(scenario: ScenarioOverview) {
    const { id } = scenario;
    return new Promise((resolve, reject) => {
      if (this.databases.hasOwnProperty(id)) {
        return reject(
          `Cannot create DB: Database with ID ${id} already exists!`,
        );
      }
      const filename = this.toFilename(id);
      if (fs.existsSync(filename)) {
        return reject(`Cannot create DB: ${filename} already exists!`);
      }
      const db = new Database(filename, logError);
      this.databases[id] = { db, filename };
      db.serialize(() => {
        db.run(`CREATE TABLE ${SCENARIO} (data TEXT)`, logError);
        db.run(
          `INSERT INTO ${SCENARIO}(data) VALUES(?)`,
          JSON.stringify(scenario),
          logError,
        );

        db.run(
          `CREATE TABLE ${ASSETS} (
          id INTEGER PRIMARY KEY,
          filename TEXT,
          mimetype TEXT,
          data BLOB
          )`,
          logError,
        );
      });
      resolve();
    });
  }

  private closeAllDatabases() {
    Object.keys(this.databases).forEach(id => this.databases[id].db.close());
  }

  private closeAllDatabasesOnExit() {
    process.on('SIGKILL', () => {
      console.log('Closing all databases...');
      this.closeAllDatabases();
    });
  }
}
