import {
  ApiUseTags,
  ApiOperation,
  ApiImplicitBody,
  ApiResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Inject,
  Body,
  Header,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RunService } from './run.service';
import { SessionMessage } from '../../adapters/models';
import { StateTransitionRequest, Inject as ScenarioInject } from '../../adapters/models';
import { SessionState } from 'trial-manager-models';
import { Trial } from '../../adapters/models/trial';

@ApiUseTags('run')
@Controller('run')
export class RunController {
  private isLoading = false;

  constructor(@Inject('RunService') private readonly runService: RunService) {}

  @ApiOperation({ title: 'Get active session' })
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

  @ApiOperation({ title: 'Get active scenario' })
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

  @ApiOperation({ title: 'Deactivate trial scenario' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No scenario active',
    type: String,
  })
  @Delete('unload')
  async unload(@Res() response: Response) {
    if (
      !this.runService.activeSession ||
      this.runService.activeSession.sessionState !== SessionState.START
    ) {
      return response
        .status(HttpStatus.NOT_FOUND)
        .send('No scenario active, please activate one first');
    }
    if (this.runService.activeSession.sessionState === SessionState.START) {
      await this.runService.close();
      return response.sendStatus(HttpStatus.OK);
    }
  }

  @ApiOperation({ title: 'Load a trial scenario and start a new session' })
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
  @ApiImplicitBody({
    name: 'Session message',
    type: SessionMessage,
  })
  @Post('load')
  async load(@Body() session: SessionMessage, @Res() response: Response) {
    if (this.isLoading) {
      return response
        .status(HttpStatus.PROCESSING)
        .send('Already loading a new scenario');
    }
    if (
      this.runService.activeSession &&
      this.runService.activeSession.sessionState === SessionState.START
    ) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('First deactivate current scenario');
    }
    try {
      this.isLoading = true;
      this.runService.init(session);
    } catch (err) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send('Could not load trial or scenario');
    } finally {
      this.isLoading = false;
    }
    return response.sendStatus(HttpStatus.OK);
  }

  @ApiOperation({ title: 'Request a state transition which may fail.' })
  @ApiImplicitBody({
    name: 'State transition request',
    type: StateTransitionRequest,
  })
  @Put('transition')
  async stateTransitionRequest(@Body() tr: StateTransitionRequest) {
    this.runService.stateTransitionRequest(tr);
  }

  @ApiOperation({ title: 'Update an inject in a running scenario.' })
  @ApiImplicitBody({
    name: 'Update inject',
    type: ScenarioInject,
  })
  @Put('update')
  async updateInject(@Body() i: ScenarioInject) {
    console.dir(`Changed ${i.title} to:`);
    console.dir(i);
    this.runService.updateOrCreateInject(i);
  }

  @ApiOperation({ title: 'Create a new inject and add it to the running scenario.' })
  @ApiImplicitBody({
    name: 'Create inject',
    type: ScenarioInject,
  })
  @Post('create')
  async createInject(@Body() i: ScenarioInject) {
    console.dir('New inject: ' + i.title + ':');
    console.dir(i);
    this.runService.updateOrCreateInject(i);
  }
}
