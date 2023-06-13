import { EmailService } from './email.service';
import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import EmailScheduleDto from 'src/dto/email-scheduling-dto';
import { CronJob } from 'cron';

@Injectable()
export class EmailSchedulingService {
  constructor(
    private readonly emailService: EmailService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  scheduleEmail(emailSchedule: EmailScheduleDto) {
    const date = new Date(emailSchedule.date);
    const job = new CronJob(date, () => {
      this.emailService.sendMail({
        to: emailSchedule.recipient,
        subject: emailSchedule.subject,
        text: emailSchedule.content,
      });
    });

    this.schedulerRegistry.addCronJob(
      `${Date.now()}-${emailSchedule.subject}`,
      job,
    );
    job.start();
  }

  cancelAllScheduledEmails() {
    this.schedulerRegistry.getCronJobs().forEach((job) => {
      job.stop();
    });
  }
}
