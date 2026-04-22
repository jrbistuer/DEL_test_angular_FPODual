import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/** Feature module providing the public health check endpoint. */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
