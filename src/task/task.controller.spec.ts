import { NotFoundException } from '@nestjs/common';
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

  it('should return a task with provided id', async() => {
    const spyOnRead = jest.spyOn(service, 'read');
    const createTaskDto = { title, description, priority, assign_to }; 

    const { data: createdTask } = await controller.create(createTaskDto);
    const result = await controller.read(createdTask.id);

    expect(spyOnRead).toHaveBeenCalledWith(createdTask.id);
    expect(result.msg).toEqual('TASK_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data).toMatchObject({
      id: createdTask.id,
      title,
      description,
      priority,
      assigned_to: assign_to
    });
  });

  it('should throw NotFound Exception when attempting to fetch with non-existing id', async() => {
    const spyOnRead = jest.spyOn(service, 'read');
    const createTaskDto = { title, description, priority, assign_to }; 
    
    const { data: createdTask } = await controller.create(createTaskDto);
    const collection = serviceMock.tasks;
    await expect(controller.read(createdTask.id+1)).rejects.toThrow(NotFoundException);

    expect(spyOnRead).toHaveBeenCalledWith(createdTask.id+1);
    expect(collection).toHaveLength(1);
  });
});
