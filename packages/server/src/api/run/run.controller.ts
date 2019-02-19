import { ApiUseTags, ApiOperation, ApiImplicitBody, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Put,
  Post,
  Inject,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { RunService } from './run.service';
import { SessionMessage } from '../../adapters/models';
import { StateTransitionRequest } from '../../adapters/models/state-transition-request';

@ApiUseTags('run')
@Controller('run')
export class RunController {
  private isLoading = false;

  constructor(@Inject('RunService') private readonly runService: RunService) {}

  @ApiOperation({ title: 'Get active trial scenario' })
  @ApiResponse({ status: 200, description: 'Session message', type: SessionMessage })
  @ApiResponse({ status: 503, description: 'Error message', type: String })
  @Get('active')
  loaded() {
    if (this.isLoading) {
      throw new HttpException(
        'Currently loading a new scenario',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    const session = this.runService.activeSession;
    if (!session) {
      throw new HttpException(
        'No session is created',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return session;
  }

  @ApiOperation({ title: 'Deactivate trial scenario' })
  @Get('unload')
  async unload() {
    if (!this.runService.activeSession) {
      throw new HttpException(
        'No scenario is loaded, please activate one first',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    await this.runService.close();
  }

  @ApiOperation({ title: 'Load a trial scenario' })
  @ApiImplicitBody({
    name: 'Session message',
    type: SessionMessage,
  })
  @Post('load')
  async load(@Body() session: SessionMessage) {
    if (this.isLoading) {
      throw new HttpException(
        'Already loading a new scenario',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    if (this.runService.activeSession) {
      throw new HttpException(
        'First deactivate current scenario',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    try {
      this.isLoading = true;
      this.runService.init(session);
    } catch (err) {
      this.isLoading = false;
      throw new HttpException(
        'Could not load trial or scenario',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.isLoading = false;
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
}
