import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { ScenarioOverview, IUploadedFile } from '../../models';
import { ScenarioRepository } from './scenario.repository';

@Injectable()
export class ScenarioService {
  private repo: ScenarioRepository;

  constructor() {
    const scenariosFolder =
      process.env.SCENARIO_MANAGER_SERVER_FOLDER || 'scenarios';
    const folder = path.resolve(process.cwd(), scenariosFolder);
    if (!fs.existsSync(folder)) {
      console.log('No scenario folder found. Creating new one: ' + folder);
      fs.mkdirSync(folder);
    }
    this.repo = new ScenarioRepository(folder);
  }

  async findSome(skip = 0, take = 25) {
    return this.repo.scenarioList.slice(skip, skip + take);
  }

  async findOne(id: string) {
    return this.findById(id);
  }

  async getScenarioFile(id: string) {
    return this.repo.getScenarioFilename(id);
  }

  async create(newScenario: ScenarioOverview) {
    if (!newScenario.title) {
      return 'Error, no title provided';
    }
    return this.repo.createScenario(newScenario);
  }

  async update(id: string, scenario: ScenarioOverview) {
    if (scenario.id !== id) {
      return `Error: Scenario id (${scenario.id}) does not match id (${id})!`;
    }
    return this.repo.updateScenario(id, scenario);
  }

  async remove(id: string) {
    return this.repo.removeScenario(id);
  }

  // Asset mgmt

  async getAssets(id: string) {
    return this.repo.getAssets(id);
  }

  async getAsset(id: string, assetId: string) {
    return this.repo.getAsset(id, assetId);
  }

  async createAsset(id: string, file: IUploadedFile) {
    return this.repo.createAsset(id, file);
  }

  async updateAsset(id: string, assetId: string, file: IUploadedFile) {
    return this.repo.updateAsset(id, assetId, file);
  }

  async removeAsset(id: string, assetId: string) {
    return this.repo.removeAsset(id, assetId);
  }

  // Private methods

  private findById(id: string) {
    return this.repo.openScenario(id);
  }
}
