import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskServiceMock } from '../../test/mocks/TaskService';
import { generateTasks, TaskMock } from '../../test/mocks/entities';
import { Task } from './task.entity';
import { TaskState } from './constants/enums';


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
    jest.clearAllMocks();
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
    const result = await controller.read({ id: createdTask.id });

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
    await expect(controller.read({ id: createdTask.id + 1 })).rejects.toThrow(NotFoundException);

    expect(spyOnRead).toHaveBeenCalledWith(createdTask.id + 1);
    expect(collection).toHaveLength(1);
  });

  
  it('should return tasks', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');

    const page = 1;
    const limit = 10;
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.totalCount).toEqual(15);
  });

  it('should return tasks data of specified page', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');

    const page = 2;
    const limit = 5;
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(5);
    expect(result.totalCount).toEqual(15);
    expect(result.data[0].id).toEqual(6);
    expect(result.data[4].id).toEqual(10);
  });

  it('should return an empty array when the specified page exceeds the total number of pages', async () => {
    const spyOnFilter = jest.spyOn(service, 'filter');

    const page = 4;
    const limit = 5;
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(0);
    expect(result.totalCount).toEqual(15);
  });

  it('should apply provided filters', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');
    
    const page = 1;
    const limit = 10;
    const priority = 2;
    const owner = 'John Doe'
    const state = TaskState.DONE;
    const tasks = generateTasks({ length: 15, priority, owner, state })
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, priority, owner, state });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, priority, owner, state });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.totalCount).toEqual(15);
  });

  it('should return tasks sorted by priority in ascending order', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');
 
    const page = 1;
    const limit = 10;
    const sortBy = 'priority';
    const sortOrder = 'asc';
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, sortBy, sortOrder });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, sortBy, sortOrder });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.data[0].priority).toBeLessThanOrEqual(result.data[9].priority);
    expect(result.totalCount).toEqual(15);
  })

  it('should return tasks sorted by priority in descending order', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');
    
    const page = 1;
    const limit = 10;
    const sortBy = 'priority';
    const sortOrder = 'desc';
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, sortBy, sortOrder });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, sortBy, sortOrder });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.data[0].priority).toBeGreaterThanOrEqual(result.data[9].priority);
    expect(result.totalCount).toEqual(15);
  })

  it('should return tasks sorted by priority in ascending order when order wasn\'t provided', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');

    const page = 1;
    const limit = 10;
    const sortBy = 'priority';
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, sortBy });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, sortBy });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.data[0].priority).toBeLessThanOrEqual(result.data[9].priority);
    expect(result.totalCount).toEqual(15);
  })


  it('should return tasks sorted by id in ascending order', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');
 
    const page = 1;
    const limit = 10;
    const sortBy = 'id';
    const sortOrder = 'asc';
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, sortBy, sortOrder });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, sortBy, sortOrder });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.data[0].id).toBeLessThanOrEqual(result.data[9].id);
    expect(result.totalCount).toEqual(15);
  })

  it('should return tasks sorted by id in descending order', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');
    
    const page = 1;
    const limit = 10;
    const sortBy = 'id';
    const sortOrder = 'desc';
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, sortBy, sortOrder });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, sortBy, sortOrder });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.data[0].id).toBeGreaterThanOrEqual(result.data[9].id);
    expect(result.totalCount).toEqual(15);
  })

  it('should return tasks sorted by id in ascending order when order wasn\'t provided', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');

    const page = 1;
    const limit = 10;
    const sortBy = 'id';
    const tasks = generateTasks({ length: 15 });
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, sortBy });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, sortBy });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.data[0].id).toBeLessThanOrEqual(result.data[9].id);
    expect(result.totalCount).toEqual(15);
  })

  it('should return tasks sorted by id in ascending order when all filters provided provided', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');

    const page = 1;
    const limit = 10;
    const priority = 2;
    const sortBy = 'id';
    const sortOrder = 'asc';
    const owner = 'John Doe'
    const state = TaskState.DONE;
    const tasks = generateTasks({ length: 15, priority, owner, state })
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, priority, owner, state, sortBy, sortOrder });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, priority, owner, state, sortBy, sortOrder });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.data[0].id).toBeLessThanOrEqual(result.data[9].id);
    expect(result.totalCount).toEqual(15);
  })

  it('should return tasks sorted by id in descending order when all filters provided provided', async() => {
    const spyOnFilter = jest.spyOn(service, 'filter');

    const page = 1;
    const limit = 10;
    const priority = 2;
    const sortBy = 'id';
    const sortOrder = 'desc';
    const owner = 'John Doe'
    const state = TaskState.DONE;
    const tasks = generateTasks({ length: 15, priority, owner, state })
    await serviceMock.seed(tasks);
    const result = await controller.list({ page, limit, priority, owner, state, sortBy, sortOrder });

    expect(spyOnFilter).toHaveBeenCalledTimes(1);
    expect(spyOnFilter).toHaveBeenCalledWith({ page, limit, priority, owner, state, sortBy, sortOrder });
    expect(result.msg).toEqual('TASKS_FETCHED');
    expect(result.data).toBeDefined();
    expect(result.data).toHaveLength(limit);
    expect(result.data[0].id).toBeGreaterThanOrEqual(result.data[9].id);
    expect(result.totalCount).toEqual(15);
  })
});
