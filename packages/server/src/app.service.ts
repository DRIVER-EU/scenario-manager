import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  root(): string {
    return 'Welcome to the Trial Guidance Management service. Please visit my <a href="./api">API</a> to use me.';
  }
}
