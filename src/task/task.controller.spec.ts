import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskServiceMock } from '../../test/mocks/TaskService';
import { TaskMock } from '../../test/mocks/entities';
import { Task } from './task.entity';


const { title, description,priority, assign_to } = TaskMock
describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const serviceMock = new TaskServiceMock()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: serviceMock
        }
      ]
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  afterEach(() => {
    serviceMock.resetData();
  });

  /**
   * Test Cases
   */

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a task', async () => {
    const spyOnCreate = jest.spyOn(service, 'create');
    const createTaskDto = { title, description, priority }; 
    const result = await controller.create(createTaskDto);
    expect(spyOnCreate).toHaveBeenCalledWith(createTaskDto);
    expect(result.msg).toEqual('TASK_CREATED');
    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data).toMatchObject({
      title,
      description,
      priority,
      assigned_to: null
    });
  });

  it('should create a task with assign_to option', async () => {
    const spyOnCreate = jest.spyOn(service, 'create');
    const createTaskDto = { title, description, priority, assign_to }; 
    const result = await controller.create(createTaskDto);
    expect(spyOnCreate).toHaveBeenCalledWith(createTaskDto);
    expect(result.msg).toEqual('TASK_CREATED');
    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data).toMatchObject({
      title,
      description,
      priority,
      assigned_to: assign_to
    });
  });
});
