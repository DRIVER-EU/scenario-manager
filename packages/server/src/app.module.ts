import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrialModule } from './api/trials/trial.module';
import { RepoModule } from './api/repo/repo.module';

@Module({
  imports: [TrialModule, RepoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
