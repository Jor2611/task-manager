import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryMock } from '../../test/mocks/RepositoryBuilder';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { generateTasks, TaskMock } from '../../test/mocks/entities';
import { TaskState } from './constants/enums';

const { title, description, priority, assign_to } = TaskMock;

describe('TaskService', () => {
  let service: TaskService;
  let repository: Repository<Task>;

  const repositoryMock = new RepositoryMock<Task>(Task).withQueryBuilder().build();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: repositoryMock
        }
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
    repositoryMock.seedCollections({ tasks: [] });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    repositoryMock.resetData();
  });

  /**
   * Test Cases
   */

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a raw task', async () => {
    const spyOneCreate = jest.spyOn(repository, 'create');
    const spyOnSave = jest.spyOn(repository, 'save');

    const task = await service.create({ title, description, priority });
    const collection = await repository.find();

    expect(task).toBeDefined();
    expect(spyOneCreate).toHaveBeenCalledTimes(1);
    expect(spyOnSave).toHaveBeenCalledTimes(1);
    expect(collection).toHaveLength(1);
    expect(collection[0].assigned_to).toBeNull();
  });

  it('should create an already assigned task when assign_to option provided', async () => {
    const spyOnCreate = jest.spyOn(repository, 'create');
    const spyOnSave = jest.spyOn(repository, 'save');

    const task = await service.create({ title, description, priority, assign_to });
    const collection = await repository.find();

    expect(task).toBeDefined();
    expect(task.assigned_to).toBe(assign_to);
    expect(spyOnCreate).toHaveBeenCalledTimes(1);
    expect(spyOnSave).toHaveBeenCalledTimes(1);
    expect(collection).toHaveLength(1);
    expect(collection[0].assigned_to).toBe(assign_to);
  });

  it('should return a task with existing task\'s id provided', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');

    const createdTask = await service.create({ title, description, priority, assign_to });
    const collection = await repository.find();
    const fetchedTask = await service.read(createdTask.id);

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTask.id });
    expect(spyOnFindOneBy).toHaveBeenCalledTimes(1);
    expect(createdTask).toBeDefined();
    expect(collection).toHaveLength(1);
    expect(fetchedTask).toBeDefined();
    expect(createdTask.id).toEqual(fetchedTask.id);
  });

  it('should throw NotFound Exception when attempting to fetch with non-existing id', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');

    const { id: taskId } = await service.create({ title, description, priority, assign_to });
    const collection = await repository.find();

    await expect(service.read(taskId + 1)).rejects.toThrow(NotFoundException);
    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: taskId + 1 });
    expect(spyOnFindOneBy).toHaveBeenCalledTimes(1);
    expect(collection).toHaveLength(1);
  });

  it('should return first 10 tasks on the list by default with only page and limit values', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const tasks = generateTasks({ length: 15 });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10 });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
    expect(result.tasks[0].title).toBe('Task 1');
    expect(result.tasks[9].title).toBe('Task 10');
  });

  it('should return correct data of provided page', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const tasks = generateTasks({ length: 15 });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 2, limit: 5 });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(5);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(5);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks).toHaveLength(5);
    expect(result.count).toBe(15);
    expect(result.tasks[0].title).toBe('Task 6');
    expect(result.tasks[4].title).toBe('Task 10');
  });

  it('should filter tasks by priority', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderWhere = jest.spyOn(QueryBuilderMock, 'andWhere');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const priority = 2;
    const tasks = generateTasks({ length: 15, priority });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledWith({ priority });
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks.every(task => task.priority === priority)).toBe(true);
    expect(result.tasks.length).toBeLessThanOrEqual(10);
    expect(result.count).toBeLessThanOrEqual(15);
  });

  it('should filter tasks by state', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderWhere = jest.spyOn(QueryBuilderMock, 'andWhere');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const state = TaskState.IN_PROGRESS;
    const tasks = generateTasks({ length: 15, state });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, state });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledWith({ state });
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks.every(task => task.state === state)).toBe(true);
    expect(result.tasks.length).toBeLessThanOrEqual(10);
    expect(result.count).toBeLessThanOrEqual(15);
  });

  it('should filter tasks by owners value', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderWhere = jest.spyOn(QueryBuilderMock, 'andWhere');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const owner = 'John Doe';
    const tasks = generateTasks({ length: 15, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, owner });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledWith({ assigned_to: owner });
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks.every(task => task.assigned_to === owner)).toBe(true);
    expect(result.tasks.length).toBeLessThanOrEqual(10);
    expect(result.count).toBeLessThanOrEqual(15);
  });

  // Note: Creating a test with filtering logic for a non-existing values wouldn't make sense here,
  // as we're primarily checking that the function is called with the correct arguments.
  // The actual filtering logic is handled by the database, which is mocked in these tests.

  it('should filter tasks by all provided filter values', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderWhere = jest.spyOn(QueryBuilderMock, 'andWhere');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const owner = 'John Doe';
    const priority = 2;
    const state = TaskState.IN_PROGRESS;
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, state, owner });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderWhere).toHaveBeenNthCalledWith(3, { assigned_to: owner });
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks.every(task => task.priority === priority)).toBe(true);
    expect(result.tasks.every(task => task.state === state)).toBe(true);
    expect(result.tasks.every(task => task.assigned_to === owner)).toBe(true);
    expect(result.tasks.length).toBeLessThanOrEqual(10);
    expect(result.count).toBeLessThanOrEqual(15);
  });

  // Note: The repository mock's sort functionality only works on properties with number value types.
  // Otherwise it will return the same result.
  it('should sort tasks by priority in descending order', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'priority';
    const sortOrder = 'desc'
    const tasks = generateTasks({ length: 15 });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, sortOrder.toUpperCase());
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].priority).toBeGreaterThanOrEqual(result.tasks[9].priority);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by priority in ascending order', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'priority';
    const sortOrder = 'asc'
    const tasks = generateTasks({ length: 15 });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, sortOrder.toUpperCase());
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].priority).toBeLessThanOrEqual(result.tasks[9].priority);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by priority in ascending order when order wasn\'t provided', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'priority';
    const tasks = generateTasks({ length: 15 });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, sortBy });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, 'ASC');
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].priority).toBeLessThanOrEqual(result.tasks[9].priority);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by priority in ascending order when all filters applied', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderAndWhere = jest.spyOn(QueryBuilderMock, 'andWhere'); 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'priority';
    const sortOrder = 'asc';
    const priority = 2;
    const state = TaskState.DONE;
    const owner = 'John Doe';
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_to: owner });
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, sortOrder.toUpperCase());
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].priority).toBeLessThanOrEqual(result.tasks[9].priority);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by priority in descending order when all filters applied', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderAndWhere = jest.spyOn(QueryBuilderMock, 'andWhere'); 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'priority';
    const sortOrder = 'desc';
    const priority = 2;
    const state = TaskState.DONE;
    const owner = 'John Doe';
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_to: owner });
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, sortOrder.toUpperCase());
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].priority).toBeGreaterThanOrEqual(result.tasks[9].priority);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by priority in ascending order when all filters applied but order wasn\'t provided', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderAndWhere = jest.spyOn(QueryBuilderMock, 'andWhere'); 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'priority';
    const priority = 2;
    const state = TaskState.IN_PROGRESS;
    const owner = 'John Doe';
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_to: owner });
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, 'ASC');
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].priority).toBeLessThanOrEqual(result.tasks[9].priority);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });


  it('should sort tasks by id in descending order', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'id';
    const sortOrder = 'desc'
    const tasks = generateTasks({ length: 15 });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, sortOrder.toUpperCase());
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].id).toBeGreaterThan(result.tasks[9].id);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by id in ascending order', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'id';
    const sortOrder = 'asc'
    const tasks = generateTasks({ length: 15 });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, sortOrder.toUpperCase());
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].id).toBeLessThan(result.tasks[9].id);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by id in ascending order when order wasn\'t provided', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'id';
    const tasks = generateTasks({ length: 15 });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, sortBy });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, 'ASC');
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].id).toBeLessThan(result.tasks[9].id);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by id in ascending order when all filters applied', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderAndWhere = jest.spyOn(QueryBuilderMock, 'andWhere'); 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'id';
    const sortOrder = 'asc';
    const priority = 2;
    const state = TaskState.DONE;
    const owner = 'John Doe';
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_to: owner });
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, sortOrder.toUpperCase());
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].id).toBeLessThanOrEqual(result.tasks[9].id);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by id in descending order when all filters applied', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderAndWhere = jest.spyOn(QueryBuilderMock, 'andWhere'); 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'id';
    const sortOrder = 'desc';
    const priority = 2;
    const state = TaskState.DONE;
    const owner = 'John Doe';
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_to: owner });
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, sortOrder.toUpperCase());
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].id).toBeGreaterThanOrEqual(result.tasks[9].id);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });

  it('should sort tasks by id in ascending order when all filters applied but order wasn\'t provided', async () => {
    const spyOnCreateQueryBuilder = jest.spyOn(repository, 'createQueryBuilder');
    const QueryBuilderMock = repositoryMock.queryBuilderMock; 
    const spyOnQueryBuilderAndWhere = jest.spyOn(QueryBuilderMock, 'andWhere'); 
    const spyOnQueryBuilderOrderBy = jest.spyOn(QueryBuilderMock, 'orderBy');
    const spyOnQueryBuilderSkip = jest.spyOn(QueryBuilderMock, 'skip');
    const spyOnQueryBuilderTake = jest.spyOn(QueryBuilderMock, 'take');
    const spyOnQueryBuilderGetMany = jest.spyOn(QueryBuilderMock, 'getMany');
    const spyOnQueryBuilderGetCount = jest.spyOn(QueryBuilderMock, 'getCount');

    const sortBy = 'id';
    const priority = 2;
    const state = TaskState.IN_PROGRESS;
    const owner = 'John Doe';
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_to: owner });
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledWith(sortBy, 'ASC');
    expect(spyOnQueryBuilderOrderBy).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks[0].id).toBeLessThanOrEqual(result.tasks[9].id);
    expect(result.tasks).toHaveLength(10);
    expect(result.count).toBe(15);
  });


});
