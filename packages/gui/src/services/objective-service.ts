import { RestService } from './rest-service';
import { IObjective } from '../models/objective';

class ObjectiveService extends RestService<IObjective> {
  constructor() {
    super('http://localhost:3000/objective/');
  }
}

export const ObjectiveSvc = new ObjectiveService();
