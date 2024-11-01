import { Test, TestingModule } from '@nestjs/testing';
import { MyjobService } from './myjob.service';

describe('MyjobService', () => {
  let service: MyjobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyjobService],
    }).compile();

    service = module.get<MyjobService>(MyjobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
