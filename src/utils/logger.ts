import * as moment from 'moment';

export class Logger {
  private scheduledPlanId: number;

  constructor(scheduledPlanId: number) {
    this.scheduledPlanId = scheduledPlanId;
  }

  info(msg: string) {
    const logText: string = `"${moment().toISOString()}","${this.scheduledPlanId}","INFO","${msg.replace(/"/g, '""')}"`;
    console.info(logText);
  }

  error(msg: string) {
    const logText: string = `"${moment().toISOString()}","${this.scheduledPlanId}","ERROR","${msg.replace(/"/g, '""')}"`;
    console.error(logText);
  }
}
