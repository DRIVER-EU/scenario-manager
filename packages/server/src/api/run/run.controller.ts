import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Header,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RunService } from './run.service';
import { SessionMessage } from '../../adapters/models';
import {
  StateTransitionRequest,
  Inject as ScenarioInject,
} from '../../adapters/models';
import { ITrial, SessionState } from 'trial-manager-models';
import { Trial } from '../../adapters/models/trial';

@ApiTags('run')
@Controller('run')
export class RunController {
  private isLoading = false;

  constructor(private readonly runService: RunService) {}

  @ApiOperation({ description: 'Get active session' })
  @ApiResponse({
    status: 200,
    description: 'Session message',
    type: SessionMessage,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reason message',
    type: String,
  })
  @Get('active')
  @Header('Cache-Control', 'max-age=1')
  loaded(@Res() response: Response) {
    if (this.isLoading) {
      return response
        .status(HttpStatus.NO_CONTENT)
        .send('Currently loading a new scenario');
    }
    const session = this.runService.activeSession;
    if (!session) {
      return response.status(HttpStatus.NO_CONTENT).send('No active session');
    }
    return response.send(session);
  }

  @ApiOperation({ description: 'Get active scenario' })
  @ApiResponse({
    status: 200,
    description: 'Trial based on the current session and the executing injects',
    type: Trial,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reason message',
    type: String,
  })
  @Get('trial')
  @Header('Cache-Control', 'max-age=1')
  activeScenario(@Res() response: Response) {
    if (this.isLoading) {
      return response
        .status(HttpStatus.NO_CONTENT)
        .send('Currently loading a new scenario');
    }
    const trial = this.runService.activeTrial;
    if (!trial) {
      return response.status(HttpStatus.NO_CONTENT).send('No active scenario');
    }
    return response.send(trial);
  }

  @ApiOperation({ description: 'Deactivate trial scenario' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No scenario active',
    type: String,
  })
  @Delete('unload')
  async unload(@Res() response: Response) {
    if (
      !this.runService.activeSession ||
      this.runService.activeSession.state !== SessionState.Started
    ) {
      this.runService.close();
    }
    if (this.runService.activeSession.state === SessionState.Started) {
      await this.runService.close();
    }
    return response.sendStatus(HttpStatus.OK);
  }

  @ApiOperation({
    description: 'Load a trial scenario and start a new session',
  })
  @ApiResponse({
    status: HttpStatus.PROCESSING,
    description: 'Busy loading',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Either a scenario is already active, or no such trial exists',
    type: String,
  })
  @ApiBody({ type: SessionMessage })
  @Post('load')
  async load(@Body() session: SessionMessage, @Res() response: Response) {
    if (this.isLoading) {
      return response
        .status(HttpStatus.PROCESSING)
        .send('Already loading a new scenario');
    }
    if (
      this.runService.activeSession &&
      this.runService.activeSession.state === SessionState.Started
    ) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('First deactivate current scenario');
    }
    let result: boolean;
    try {
      this.isLoading = true;
      result = await this.runService.init(session);
    } catch (err) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('Could not load trial or scenario');
    } finally {
      this.isLoading = false;
    }
    return response.sendStatus(
      result ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  @ApiOperation({ description: 'Request a state transition which may fail.' })
  @ApiBody({ type: StateTransitionRequest })
  @Put('transition')
  async stateTransitionRequest(@Body() tr: StateTransitionRequest) {
    this.runService.stateTransitionRequest(tr);
  }

  @ApiOperation({ description: 'Init the execSvc.' })
  @ApiBody({ type: Trial })
  @Put('init')
  async init(@Body() i: ITrial, @Res() response: Response) {
    this.runService.initExecSvc(i);
    return response.sendStatus(HttpStatus.OK);
  }

  @ApiOperation({ description: 'Force an inject push to Kafka.' })
  @ApiBody({ type: ScenarioInject })
  @Put('force')
  async forceInject(@Body() i: ScenarioInject) {
    this.runService.forceInject(i);
  }

  @ApiOperation({
    description:
      'Get a list of all registered message topics. Ignores system_logging, system_heartbeat, simulation_time_control, and simulation_session_mgmt',
  })
  @ApiResponse({ status: 200, type: String, isArray: true })
  @Get('topics')
  getTopics(@Res() response: Response) {
    const topics = this.runService
      .getProduceTopics()
      .map((t) => t.toLowerCase())
      .filter(
        (t) =>
          [
            'system_logging',
            'system_heartbeat',
            'simulation_time_control',
            'simulation_session_mgmt',
            'named_json',
            'system_tm_role_player'
          ].indexOf(t) < 0,
      );
    return response.send(topics);
  }

  @ApiOperation({ description: 'Update an inject in a running scenario.' })
  @ApiBody({ type: ScenarioInject })
  @Put('update')
  async updateInject(@Body() i: ScenarioInject) {
    console.dir(`Changed ${i.title} to:`);
    console.dir(i);
    this.runService.updateOrCreateInject(i);
  }

  @ApiOperation({
    description: 'Create a new inject and add it to the running scenario.',
  })
  @ApiBody({ type: ScenarioInject })
  @Post('create')
  async createInject(@Body() i: ScenarioInject) {
    console.dir('New inject: ' + i.title + ':');
    console.dir(i);
    this.runService.updateOrCreateInject(i);
  }
}
