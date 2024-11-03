import { Test, TestingModule } from '@nestjs/testing';
import { MyjobController } from './myjob.controller';
import { MyjobService } from './myjob.service';

describe('MyjobController', () => {
  let controller: MyjobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyjobController],
      providers: [MyjobService],
    }).compile();

    controller = module.get<MyjobController>(MyjobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
