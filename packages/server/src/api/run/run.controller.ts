import { ApiUseTags, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Param, Inject } from '@nestjs/common';
import { TrialService } from '../trials/trial.service';

@ApiUseTags('runs')
@Controller('runs')
export class RunController {
  private loadedScenario: any;

  constructor(
    @Inject('TrialService') private readonly trialService: TrialService,
  ) {}

  @ApiOperation({ title: 'Get loaded trial scenario' })
  @Get()
  loaded() {
    // return this.trialService.findSome(skip, take);
  }

  @ApiOperation({ title: 'Unload trial scenario' })
  @Get()
  unload() {
    // return this.trialService.findSome(skip, take);
  }

  @ApiOperation({ title: 'Load or reload a trial scenario' })
  @Get(':trialId/:scenarioId')
  async load(
    @Param('trialId') trialId: string,
    @Param('scenarioId') scenarioId: string,
  ) {
    const trial = await this.trialService.findOne(trialId);
    // const scenario = trial.inj
    // return this.trialService.create(newTrial);
  }
}
