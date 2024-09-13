import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { TaskMock, taskSeedData } from './mocks/entities';
import { TaskState } from '../src/task/constants/enums';

const { title, description, priority, assign_to } = TaskMock;
describe('Task (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterEach(async() => {
    const repository = dataSource.getRepository('Task');
    await repository.query(`TRUNCATE TABLE task RESTART IDENTITY CASCADE;`);  
    await app.close();
  });

  it('db connection to app should be established', async() => {
    const isConnected = dataSource.isInitialized;
    expect(isConnected).toBe(true);
  });

  it('should create a new task | POST /task', async () => {
    const newTask = {
      title,
      description,
      priority,
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('msg', 'TASK_CREATED');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id');
    expect(body.data.title).toEqual(title);
    expect(body.data.description).toEqual(description);
    expect(body.data.priority).toEqual(priority);

    const repository = dataSource.getRepository('Task');
    const createdTask = await repository.findOne({ where: { id: body.data.id } });
    expect(createdTask).toBeDefined();
  });

  it('should create a new task with assign_to | POST /task', async () => {
    const newTask = {
      title,
      description,
      priority,
      assign_to
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('msg', 'TASK_CREATED');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id');
    expect(body.data.title).toEqual(title);
    expect(body.data.description).toEqual(description);
    expect(body.data.priority).toEqual(priority);
    expect(body.data.assigned_user_id).toEqual(assign_to);

    const repository = dataSource.getRepository('Task');
    const createdTask = await repository.findOne({ where: { id: body.data.id } });
    expect(createdTask).toBeDefined();
    expect(createdTask.assigned_user_id).toEqual(assign_to);
    expect(createdTask.assigned_at).toBeInstanceOf(Date);
  });

  it('should create a new task without assign_to | POST /task', async () => {
    const newTask = {
      title,
      description,
      priority,
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('msg', 'TASK_CREATED');
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id');
    expect(body.data.title).toEqual(title);
    expect(body.data.description).toEqual(description);
    expect(body.data.priority).toEqual(priority);
    expect(body.data.assigned_user_id).toBeNull();

    const repository = dataSource.getRepository('Task');
    const createdTask = await repository.findOne({ where: { id: body.data.id } });
    expect(createdTask).toBeDefined();
    expect(createdTask.assigned_user_id).toBeNull();
    expect(createdTask.assigned_at).toBeNull();
  });

  it('should return 400 when task title is too long | POST /task', async () => {
    const newTask = {
      title: 'A'.repeat(36),
      description,
      priority,
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toContain('title_must_be_shorter_than_or_equal_to_35_characters');
  });

  it('should return 400 when task title is wrong type | POST /task', async () => {
    const newTask = {
      title: 65,
      description,
      priority,
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toBe('title_must_be_a_string');
  });

  it('should return 400 when task title is empty | POST /task', async () => {
    const newTask = {
      title: '',
      description,
      priority,
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toContain('title_must_be_longer_than_or_equal_to_2_characters');
  });

  it('should return 400 when task description is empty | POST /task', async () => {
    const newTask = {
      title,
      description: '',
      priority,
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toContain('description_must_be_longer_than_or_equal_to_10_characters');
  });

  it('should return 400 when task description is too long | POST /task', async () => {
    const newTask = {
      title,
      description: 'A'.repeat(151),
      priority,
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toContain('description_must_be_shorter_than_or_equal_to_150_characters');
  });

  it('should return 400 when task description is wrong type | POST /task', async () => {
    const newTask = {
      title,
      description: 123,
      priority,
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toBe('description_must_be_a_string');
  });

  it('should return 400 when task priority is wrong type | POST /task', async () => {
    const newTask = {
      title,
      description,
      priority: 'high',
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toBe('priority_must_be_an_integer_number');
  });

  it('should return 400 when assign_to is wrong type | POST /task', async () => {
    const newTask = {
      title,
      description,
      priority,
      assign_to: 'user1',
    };

    const { body } = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
  });

  it('should return 200 and task details when valid id is provided | GET /task/:id', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      priority: 2,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    const createdTaskId = createResponse.body.data.id;

    const { body } = await request(app.getHttpServer())
      .get(`/task/${createdTaskId}`)
      .expect(200);

    expect(body).toEqual({
      success: true,
      msg: 'TASK_FETCHED',
      data: expect.objectContaining({
        id: createdTaskId,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        state: expect.any(String),
      }),
    });
  });

  it('should return 400 when invalid id type is provided | GET /task/:id', async () => {
    const invalidId = 'abc';
    const { body } = await request(app.getHttpServer())
      .get(`/task/${invalidId}`)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toBe('id_must_be_a_positive_number');
  });

  it('should return 404 when non-existent task id is provided | GET /task/:id', async () => {
    const nonExistentId = 9999;
    const { body } = await request(app.getHttpServer())
      .get(`/task/${nonExistentId}`)
      .expect(404);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toBe('TASK_NOT_FOUND');
  });

  it('should return 400 when null value is provided for id | GET /task/:id', async () => {
    const nullId = null;
    const { body } = await request(app.getHttpServer())
      .get(`/task/${nullId}`)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
    expect(body.msg).toBe('id_must_be_a_positive_number');
  });

  it('should update task state correctly when assigned_user_id exists | PATCH /task/:id', async () => {
    const newTask = {
      title: 'Test Update Task',
      description: 'This is a test task for updating state',
      priority: 2,
      assign_to: 1,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    const createdTaskId = createResponse.body.data.id;

    let updateResponse = await request(app.getHttpServer())
      .patch(`/task/${createdTaskId}`)
      .send({ state: 'in_progress' })
      .expect(200);
    
    expect(updateResponse.body.data.state).toBe('in_progress');
    expect(updateResponse.body.data.progress_started_at).toBeTruthy();

    updateResponse = await request(app.getHttpServer())
      .patch(`/task/${createdTaskId}`)
      .send({ state: 'done' })
      .expect(200);

    expect(updateResponse.body.data.state).toBe('done');
    expect(updateResponse.body.data.done_at).toBeTruthy();

    updateResponse = await request(app.getHttpServer())
      .patch(`/task/${createdTaskId}`)
      .send({ state: 'in_progress' })
      .expect(400);

    expect(updateResponse.body.msg).toBe('INVALID_STATE_TRANSITION');

    updateResponse = await request(app.getHttpServer())
      .patch(`/task/${createdTaskId}`)
      .send({ state: 'cancelled' })
      .expect(400);

    expect(updateResponse.body.msg).toBe('INVALID_STATE_TRANSITION');

    const anotherTask = {
      title: 'Another Test Task',
      description: 'This is another test task for updating state',
      priority: 1,
      assign_to: 2,
    };

    const anotherCreateResponse = await request(app.getHttpServer())
      .post('/task')
      .send(anotherTask)
      .expect(201);

    const anotherTaskId = anotherCreateResponse.body.data.id;

    updateResponse = await request(app.getHttpServer())
      .patch(`/task/${anotherTaskId}`)
      .send({ state: 'cancelled' })
      .expect(400);

    expect(updateResponse.body.msg).toBe('INVALID_STATE_TRANSITION');

    updateResponse = await request(app.getHttpServer())
      .patch(`/task/${anotherTaskId}`)
      .send({ state: 'in_progress' })
      .expect(200);

    expect(updateResponse.body.data.state).toBe('in_progress');
    expect(updateResponse.body.data.progress_started_at).toBeTruthy();

    updateResponse = await request(app.getHttpServer())
      .patch(`/task/${anotherTaskId}`)
      .send({ state: 'cancelled' })
      .expect(200);

    expect(updateResponse.body.data.state).toBe('cancelled');
    expect(updateResponse.body.data.cancelled_at).toBeTruthy();

    updateResponse = await request(app.getHttpServer())
      .patch(`/task/${anotherTaskId}`)
      .send({ state: 'in_progress' })
      .expect(400);

    expect(updateResponse.body.msg).toBe('INVALID_STATE_TRANSITION');
  });

  it('should not update task state when assigned_user_id does not exist | PATCH /task/:id', async () => {
    const newTask = {
      title: 'Test Unassigned Task',
      description: 'This is a test task without assigned user',
      priority: 2,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    const createdTaskId = createResponse.body.data.id;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/task/${createdTaskId}`)
      .send({ state: 'in_progress' })
      .expect(400);

    expect(updateResponse.body.msg).toBe('TASK_MUST_BE_ASSIGNED');
  });

  it('should update other task properties correctly | PATCH /task/:id', async () => {
    const newTask = {
      title: 'Test Update Properties',
      description: 'This is a test task for updating properties',
      priority: 2,
      assigned_user_id: 3, // Assuming user with id 3 exists
    };

    const createResponse = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    const createdTaskId = createResponse.body.data.id;

    // Update task properties
    const updatedProperties = {
      title: 'Updated Title',
      description: 'Updated description',
      priority: 3,
      assigned_user_id: 5,
    };

    const updateResponse = await request(app.getHttpServer())
      .patch(`/task/${createdTaskId}`)
      .send(updatedProperties)
      .expect(200);

    expect(updateResponse.body.data).toMatchObject(updatedProperties);
  });

  it('should return 404 when updating non-existent task | PATCH /task/:id', async () => {
    const nonExistentId = 9999; // Assuming this id doesn't exist
    const updateData = { title: 'Updated Title' };

    const { body } = await request(app.getHttpServer())
      .patch(`/task/${nonExistentId}`)
      .send(updateData)
      .expect(404);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg', 'TASK_NOT_FOUND');
  });

  it('should return 400 when updating with invalid data | PATCH /task/:id', async () => {
    // Create a new task
    const newTask = {
      title: 'Test Invalid Update',
      description: 'This is a test task for invalid updates',
      priority: 2,
      assigned_user_id: 4, // Assuming user with id 4 exists
    };

    const createResponse = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    const createdTaskId = createResponse.body.data.id;

    const invalidUpdateData = {
      title: '',
      priority: 5,
    };

    const { body } = await request(app.getHttpServer())
      .patch(`/task/${createdTaskId}`)
      .send(invalidUpdateData)
      .expect(400);

    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('msg');
  });

  it('should remove a task successfully | DELETE /task/:id', async () => {
    const newTask = {
      title: 'Task to be removed',
      description: 'This task will be removed',
      priority: 2,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/task')
      .send(newTask)
      .expect(201);

    const createdTaskId = createResponse.body.data.id;

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/task/${createdTaskId}`)
      .expect(200); // By convention we should return 204 no Content status, but for app response consistency 200 with content will remain

    expect(deleteResponse.body).toHaveProperty('success', true);
    expect(deleteResponse.body).toHaveProperty('msg', 'TASK_DELETED');

    const getResponse = await request(app.getHttpServer())
      .get(`/task/${createdTaskId}`)
      .expect(404);

    expect(getResponse.body).toHaveProperty('success', false);
    expect(getResponse.body).toHaveProperty('msg', 'TASK_NOT_FOUND');
  });

  it('should return 404 when trying to remove a non-existent task | DELETE /task/:id', async () => {
    const nonExistentId = 9999;

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/task/${nonExistentId}`)
      .expect(404);
    expect(deleteResponse.body).toHaveProperty('success', false);
    expect(deleteResponse.body).toHaveProperty('msg', 'TASK_NOT_FOUND');
  });

  it('should return 400 when trying to remove a task with invalid id | DELETE /task/:id', async () => {
    const invalidId = 'abc';

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/task/${invalidId}`)
      .expect(400);

    expect(deleteResponse.body).toHaveProperty('success', false);
    expect(deleteResponse.body).toHaveProperty('msg', 'id_must_be_a_positive_number');
  });

  
})
