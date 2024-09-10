import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepositoryMock } from '../../test/mocks/RepositoryBuilder';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { TaskMock } from '../../test/mocks/entities';


const { title, description, priority, assign_to } = TaskMock;

describe('TaskService', () => {
  let service: TaskService;
  let repository: Repository<Task>;

  const repositoryMock = new RepositoryMock<Task>(Task).build();

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

  afterEach(async() => {
    jest.clearAllMocks();
    repositoryMock.resetData();
  });

  /**
   * Test Cases
   */

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a raw task', async() => {
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

  it('should create an already assigned task when assign_to option provided', async() => {
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

  it('should return a task with existing task\'s id provided', async()=>{
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
});
