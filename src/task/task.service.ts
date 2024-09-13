import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Task } from './task.entity';
import { ICreateTask, IGenerateReport, ITaskFilter, IUpdateTask } from './constants/interfaces';
import { TaskState } from './constants/enums';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly repository: Repository<Task>
  ) {}

  async read(id: number) {
    const task = await this.repository.findOneBy({ id });
    
    if (!task) {
      throw new NotFoundException('TASK_NOT_FOUND');
    }

    return task;
  }

  async create(data: ICreateTask) {
    const { assign_to, ...restDetails } = data;

    const task = this.repository.create({
      ...restDetails,
      assigned_user_id: assign_to || null,
      assigned_at: assign_to ? new Date() : null,
      state: TaskState.TODO
    }); 

    try {
      return await this.repository.save(task);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('FAILED_TO_CREATE_TASK');
    }
  }

  async filter(data: ITaskFilter) {
    const { page, limit, priority, owner, state, sortOrder, sortBy } = data;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('task');

    if (priority) {
      queryBuilder.andWhere({ priority });
    }

    if (state) {
      queryBuilder.andWhere({ state });
    }

    if (owner) {
      queryBuilder.andWhere({ assigned_user_id: owner });
    }
    
    if (sortBy) {
      const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(sortBy, order);
    }

    const tasks = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    const count = await queryBuilder.getCount();
    
    return { tasks, count };
  }

  async update(id: number, updateTaskDto: IUpdateTask) {
    const task = await this.repository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException('TASK_NOT_FOUND');
    }
  
    const { title, description, priority, assigned_user_id, state } = updateTaskDto;
  
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
  
    if (assigned_user_id) {
      task.assigned_user_id = assigned_user_id;
      if (!task.assigned_at) {
        task.assigned_at = new Date();
      }
    }
  
    if (state) {
      switch (task.state) {
        case TaskState.TODO:
          if (state === TaskState.IN_PROGRESS) {
            if (!task.assigned_user_id) {
              throw new BadRequestException('TASK_MUST_BE_ASSIGNED');
            }
            task.progress_started_at = task.progress_started_at || new Date();
          } else if (state !== TaskState.TODO) {
            throw new BadRequestException('INVALID_STATE_TRANSITION');
          }
          break;
  
        case TaskState.IN_PROGRESS:
          if (state === TaskState.DONE) {
            task.done_at = task.done_at || new Date();
          } else if (state === TaskState.CANCELLED) {
            task.cancelled_at = task.cancelled_at || new Date();
          } else if (state !== TaskState.IN_PROGRESS) {
            throw new BadRequestException('INVALID_STATE_TRANSITION');
          }
          break;
  
        case TaskState.DONE:
        case TaskState.CANCELLED:
          if (state !== task.state) {
            throw new BadRequestException('INVALID_STATE_TRANSITION');
          }
          break;

        default:
          break;
      }
  
      if (task.state !== state) {
        task.state = state;
      }
    }
  
    return this.repository.save(task);
  }

  async remove(id: number) {
    const task = await this.repository.findOneBy({ id });
    
    if (!task) {
      throw new NotFoundException('TASK_NOT_FOUND');
    }

    return await this.repository.remove(task);
  }

  async generateReport(reportDto: IGenerateReport): Promise<any> {
    const { user_id, period_from, period_to } = reportDto;
    const startDate = period_from ? new Date(period_from) : new Date(0);
    const endDate = period_to ? new Date(period_to) : new Date();

    const filters: any = {
      where: {
        created_at: Between(startDate, endDate),
      },
    };

    if (user_id) {
      filters.where.assigned_user_id = user_id;
    }

    const tasks = await this.repository.find(filters);
    const doneTasks = tasks.filter(task => task.state === TaskState.DONE).length;

    const doneTasksCompletionTimes = tasks
      .filter(task => task.state === TaskState.DONE)
      .map(task => (task.done_at?.getTime() ?? 0) - (task.progress_started_at?.getTime() ?? 0));

    const averageCompletionTimeMin = doneTasksCompletionTimes.length
      ? Math.round((doneTasksCompletionTimes.reduce((sum, time) => sum + time, 0) / doneTasksCompletionTimes.length) / 60000)
      : 0;

    const inProgressCount = tasks.filter(task => task.state === TaskState.IN_PROGRESS).length;
    const todoCount = tasks.filter(task => task.state === TaskState.TODO).length;

    return {
      doneTasksCount: doneTasks,
      averageCompletionTimeMin,
      inProgressCount,
      todoCount,
    };
  }
}
