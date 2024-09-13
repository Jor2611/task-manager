import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryMock } from '../../test/mocks/RepositoryBuilder';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { generateTasks, TaskMock } from '../../test/mocks/entities';
import { TaskState } from './constants/enums';

const { 
  title,
  updatedTitle, 
  description,
  updatedDescription, 
  priority,
  updatedPriority,
  assign_to 
} = TaskMock;

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
    expect(collection[0].assigned_user_id).toBeNull();
  });

  it('should create an already assigned task when assign_to option provided', async () => {
    const spyOnCreate = jest.spyOn(repository, 'create');
    const spyOnSave = jest.spyOn(repository, 'save');

    const task = await service.create({ title, description, priority, assign_to });
    const collection = await repository.find();

    expect(task).toBeDefined();
    expect(task.assigned_user_id).toBe(assign_to);
    expect(spyOnCreate).toHaveBeenCalledTimes(1);
    expect(spyOnSave).toHaveBeenCalledTimes(1);
    expect(collection).toHaveLength(1);
    expect(collection[0].assigned_user_id).toBe(assign_to);
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

    const owner = 15;
    const tasks = generateTasks({ length: 15, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, owner });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledWith({ assigned_user_id: owner });
    expect(spyOnQueryBuilderWhere).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks.every(task => task.assigned_user_id === owner)).toBe(true);
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

    const owner = 15;
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
    expect(spyOnQueryBuilderWhere).toHaveBeenNthCalledWith(3, { assigned_user_id: owner });
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledWith(0);
    expect(spyOnQueryBuilderSkip).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledWith(10);
    expect(spyOnQueryBuilderTake).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetMany).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderGetCount).toHaveBeenCalledTimes(1);
    expect(result.tasks.every(task => task.priority === priority)).toBe(true);
    expect(result.tasks.every(task => task.state === state)).toBe(true);
    expect(result.tasks.every(task => task.assigned_user_id === owner)).toBe(true);
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
    const owner = 15;
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_user_id: owner });
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
    const owner = 15;
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_user_id: owner });
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
    const owner = 15;
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_user_id: owner });
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
    const owner = 15;
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_user_id: owner });
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
    const owner = 15;
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy, sortOrder });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_user_id: owner });
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
    const owner = 15;
    const tasks = generateTasks({ length: 15, priority, state, owner });
    repositoryMock.seedCollections({ tasks });

    const result = await service.filter({ page: 1, limit: 10, priority, owner, state, sortBy });

    expect(spyOnCreateQueryBuilder).toHaveBeenCalledWith('task');
    expect(spyOnCreateQueryBuilder).toHaveBeenCalledTimes(1);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenCalledTimes(3);
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(1, { priority });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(2, { state });
    expect(spyOnQueryBuilderAndWhere).toHaveBeenNthCalledWith(3, { assigned_user_id: owner });
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

  it('should update title, description, and priority of a task', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const createdTask = await service.create({ title, description, priority });

    const updatedTask = await service.update(createdTask.id, {
      title: updatedTitle,
      description: updatedDescription,
      priority: updatedPriority,
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTask.id });
    expect(spyOnSave).toHaveBeenCalledTimes(2);
    expect(updatedTask).toBeDefined();
    expect(updatedTask.id).toEqual(createdTask.id);
    expect(updatedTask.title).toEqual(updatedTitle);
    expect(updatedTask.description).toEqual(updatedDescription);
    expect(updatedTask.priority).toEqual(updatedPriority);
  });

  it('should update title, description, and priority of a task', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const createdTask = await service.create({ title, description, priority });

    const updatedTask = await service.update(createdTask.id, {
      title: updatedTitle,
      description: updatedDescription,
      priority: updatedPriority,
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTask.id });
    expect(spyOnSave).toHaveBeenCalledTimes(2);
    expect(updatedTask).toBeDefined();
    expect(updatedTask.id).toEqual(createdTask.id);
    expect(updatedTask.title).toEqual(updatedTitle);
    expect(updatedTask.description).toEqual(updatedDescription);
    expect(updatedTask.priority).toEqual(updatedPriority);
  });

  it('should update assigned user id when it is provided', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const createdTask = await service.create({ title, description, priority });

    const updatedTask = await service.update(createdTask.id, {
      assigned_user_id: assign_to,
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTask.id });
    expect(spyOnSave).toHaveBeenCalledTimes(2);
    expect(updatedTask).toBeDefined();
    expect(updatedTask.id).toEqual(createdTask.id);
    expect(updatedTask.assigned_user_id).toEqual(assign_to);
  });

  it('should update state to IN_PROGRESS from TODO if user already assigned', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId, state: createdTaskState } = await service.create({ 
      title, 
      description, 
      priority, 
      assign_to: assign_to
    });

    const updatedTask = await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(2);
    expect(createdTaskState).toEqual(TaskState.TODO);
    expect(updatedTask).toBeDefined();
    expect(updatedTask.id).toEqual(createdTaskId);
    expect(updatedTask.title).toEqual(title);
    expect(updatedTask.state).toEqual(TaskState.IN_PROGRESS);
    expect(updatedTask.assigned_user_id).toEqual(assign_to);
  });

  it('should update state to IN_PROGRESS from TODO when updating with new user', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId, state: createdTaskState } = await service.create({ 
      title, 
      description, 
      priority
    });

    const updatedTask = await service.update(createdTaskId, {
      assigned_user_id: assign_to,
      state: TaskState.IN_PROGRESS,
    });
    
    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(2);
    expect(createdTaskState).toEqual(TaskState.TODO);
    expect(updatedTask).toBeDefined();
    expect(updatedTask.id).toEqual(createdTaskId);
    expect(updatedTask.title).toEqual(title);
    expect(updatedTask.state).toEqual(TaskState.IN_PROGRESS);
    expect(updatedTask.assigned_user_id).toEqual(assign_to);
  });

  it('should not update the progress date if attempting to update state from IN_PROGRESS to IN_PROGRESS again', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({
      title,
      description,
      priority,
      assign_to
    });
    const { progress_started_at: initialProgressStartedAt } = await service.update(createdTaskId, { state: TaskState.IN_PROGRESS });

    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedTask = await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(updatedTask.state).toBe(TaskState.IN_PROGRESS);
    expect(updatedTask.progress_started_at.getTime()).toBe(initialProgressStartedAt.getTime());
  });

  it('should not update state from TODO to IN_PROGRESS if there is no user assigned and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId, state: initialTaskState, assigned_user_id } = await service.create({ 
      title, 
      description, 
      priority
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    })).rejects.toThrow('TASK_MUST_BE_ASSIGNED');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(1);
    expect(initialTaskState).toEqual(TaskState.TODO);
    expect(assigned_user_id).toBeNull();
  });

  it('should not update state from TODO to DONE if there is no user assigned and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId, state: initialTaskState, assigned_user_id }  = await service.create({ 
      title, 
      description, 
      priority
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.DONE,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(1);
    expect(initialTaskState).toEqual(TaskState.TODO);
    expect(assigned_user_id).toBeNull();
  });

  it('should not update state from TODO to DONE if task has user assigned and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId, state: initialTaskState, assigned_user_id } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.DONE,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(1);
    expect(initialTaskState).toEqual(TaskState.TODO);
    expect(assigned_user_id).toEqual(assign_to);
  });

  it('should not update state from TODO to CANCELLED if there is no user assigned and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId, state: initialTaskState, assigned_user_id }  = await service.create({ 
      title, 
      description, 
      priority
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(1);
    expect(initialTaskState).toEqual(TaskState.TODO);
    expect(assigned_user_id).toBeNull();
  });

  it('should not update state from TODO to CANCELLED if task has user assigned and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId, state: initialTaskState, assigned_user_id } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(1);
    expect(initialTaskState).toEqual(TaskState.TODO);
    expect(assigned_user_id).toEqual(assign_to);
  });

  it('should update state from IN_PROGRESS to DONE', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const updatedTask = await service.update(createdTaskId, {
      state: TaskState.DONE,
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(updatedTask.state).toEqual(TaskState.DONE);
    expect(updatedTask.done_at).toBeDefined();
  });

  it('should update state from IN_PROGRESS to CANCELLED', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const updatedTask = await service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(updatedTask.state).toEqual(TaskState.CANCELLED);
    expect(updatedTask.cancelled_at).toBeDefined();
  });

  it('should not update state from IN_PROGRESS to TODO', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId, assigned_user_id } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    const { state: inProgressState } = await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.TODO,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(2);
    expect(inProgressState).toEqual(TaskState.IN_PROGRESS);
    expect(assigned_user_id).toEqual(assign_to);
  });

  it('should not update done_at date when attempting to update the state from DONE to DONE', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const { done_at: initialDoneAt } = await service.update(createdTaskId, {
      state: TaskState.DONE,
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const secondDoneUpdate = await service.update(createdTaskId, {
      state: TaskState.DONE,
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(4);
    expect(secondDoneUpdate.state).toEqual(TaskState.DONE);
    expect(secondDoneUpdate.done_at.getTime()).toEqual(initialDoneAt.getTime());
  });

  it('should not update state from DONE to TODO and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const doneTask = await service.update(createdTaskId, {
      state: TaskState.DONE,
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.TODO,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(doneTask.state).toEqual(TaskState.DONE);
  });

  it('should not update state from DONE to IN_PROGRESS and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const doneTask = await service.update(createdTaskId, {
      state: TaskState.DONE,
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(doneTask.state).toEqual(TaskState.DONE);
  });

  it('should not update state from DONE to CANCELLED and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const doneTask = await service.update(createdTaskId, {
      state: TaskState.DONE,
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(doneTask.state).toEqual(TaskState.DONE);
  });

  it('should not update state from CANCELLED to IN_PROGRESS and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const cancelledTask = await service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(cancelledTask.state).toEqual(TaskState.CANCELLED);
  });

  it('should not update state from CANCELLED to DONE and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const cancelledTask = await service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.DONE,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(cancelledTask.state).toEqual(TaskState.CANCELLED);
  });

  it('should not update state from CANCELLED to TODO and throw BadRequestException', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const cancelledTask = await service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    });

    await expect(service.update(createdTaskId, {
      state: TaskState.TODO,
    })).rejects.toThrow('INVALID_STATE_TRANSITION');

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(3);
    expect(cancelledTask.state).toEqual(TaskState.CANCELLED);
  });

  it('should not update cancelled_at when attempting to update from CANCELLED to CANCELLED', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnSave = jest.spyOn(repository, 'save');

    const { id: createdTaskId } = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    await service.update(createdTaskId, {
      state: TaskState.IN_PROGRESS,
    });

    const cancelledTask = await service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    });

    const initialCancelledAt = cancelledTask.cancelled_at;

    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedTask = await service.update(createdTaskId, {
      state: TaskState.CANCELLED,
    });

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTaskId });
    expect(spyOnSave).toHaveBeenCalledTimes(4);
    expect(updatedTask.state).toEqual(TaskState.CANCELLED);
    expect(updatedTask.cancelled_at.getTime()).toBe(initialCancelledAt.getTime());
  });

  it('should remove an existing task', async () => {
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy');
    const spyOnRemove = jest.spyOn(repository, 'remove');

    const createdTask = await service.create({ 
      title, 
      description, 
      priority,
      assign_to
    });

    const result = await service.remove(createdTask.id);

    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: createdTask.id });
    expect(spyOnRemove).toHaveBeenCalledWith(createdTask);
    expect(result).toEqual(createdTask);
  });

  it('should throw NotFoundException when trying to remove a non-existent task', async () => {
    const nonExistentId = 9999;
    const spyOnFindOneBy = jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

    await expect(service.remove(nonExistentId)).rejects.toThrow('TASK_NOT_FOUND');
    expect(spyOnFindOneBy).toHaveBeenCalledWith({ id: nonExistentId });
  });

  it('should generate a report for all tasks within a given period', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const tasks = generateTasks({ length: 10 });
    tasks.forEach((task, index) => {
      task.created_at = new Date(startDate.getTime() + index * 86400000); // One day apart
      if (index < 5) {
        task.state = TaskState.DONE;
        task.done_at = new Date(task.created_at.getTime() + 3600000); // 1 hour after creation
        task.progress_started_at = new Date(task.created_at.getTime() + 1800000); // 30 minutes after creation
      } else if (index < 8) {
        task.state = TaskState.IN_PROGRESS;
        task.progress_started_at = new Date(task.created_at.getTime() + 1800000);
      }
    });

    jest.spyOn(repository, 'find').mockResolvedValue(tasks);

    const report = await service.generateReport({
      period_from: startDate.toISOString(),
      period_to: endDate.toISOString()
    });

    expect(report).toEqual({
      doneTasksCount: 5,
      averageCompletionTimeMin: 30,
      inProgressCount: 3,
      todoCount: 2
    });
  });

  it('should generate a report for a specific user', async () => {
    const userId = 1;
    const tasks = generateTasks({ length: 5, owner: userId });
    tasks.forEach((task, index) => {
      if (index < 3) {
        task.state = TaskState.DONE;
        task.done_at = new Date(task.created_at.getTime() + 7200000); // 2 hours after creation
        task.progress_started_at = new Date(task.created_at.getTime() + 3600000); // 1 hour after creation
      }
    });

    jest.spyOn(repository, 'find').mockResolvedValue(tasks);

    const report = await service.generateReport({ user_id: userId });

    expect(report).toEqual({
      doneTasksCount: 3,
      averageCompletionTimeMin: 60,
      inProgressCount: 0,
      todoCount: 2
    });
  });

  it('should return correct amount of in_progress tasks', async () => {
    const tasks = generateTasks({ length: 10 });
    tasks.forEach((task, index) => {
      if (index < 4) {
        task.state = TaskState.IN_PROGRESS;
        task.progress_started_at = new Date(task.created_at.getTime() + 1800000); // 30 minutes after creation
      }
    });

    jest.spyOn(repository, 'find').mockResolvedValue(tasks);

    const report = await service.generateReport({});

    expect(report.inProgressCount).toEqual(4);
    expect(report).toEqual({
      doneTasksCount: 0,
      averageCompletionTimeMin: 0,
      inProgressCount: 4,
      todoCount: 6
    });
  });

  it('should return correct amount of in_progress tasks for a specific user', async () => {
    const userId = 1;
    const tasks = generateTasks({ length: 8, owner: userId });
    tasks.forEach((task, index) => {
      if (index < 3) {
        task.state = TaskState.IN_PROGRESS;
        task.progress_started_at = new Date(task.created_at.getTime() + 1800000); // 30 minutes after creation
      }
    });

    jest.spyOn(repository, 'find').mockResolvedValue(tasks);

    const report = await service.generateReport({ user_id: userId });

    expect(report.inProgressCount).toEqual(3);
    expect(report).toEqual({
      doneTasksCount: 0,
      averageCompletionTimeMin: 0,
      inProgressCount: 3,
      todoCount: 5
    });
  });

  it('should return zero values when no tasks are found', async () => {
    jest.spyOn(repository, 'find').mockResolvedValue([]);

    const report = await service.generateReport({});

    expect(report).toEqual({
      doneTasksCount: 0,
      averageCompletionTimeMin: 0,
      inProgressCount: 0,
      todoCount: 0
    });
  });
});
