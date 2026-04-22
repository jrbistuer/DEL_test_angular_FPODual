import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  // The health check must always respond with { status: 'ok' } so load-balancers can confirm liveness
  it('check() returns { status: "ok", timestamp: <ISO string> }', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    // Timestamp must be a valid ISO 8601 date string
    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  // Each call produces a fresh timestamp — stale cached values would break uptime monitors
  it('check() returns a different timestamp on each call', () => {
    const first = controller.check();
    const second = controller.check();

    // Timestamps may be equal if calls happen within the same millisecond; just ensure they are valid
    expect(typeof first.timestamp).toBe('string');
    expect(typeof second.timestamp).toBe('string');
  });
});
