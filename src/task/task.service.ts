import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { ICreateTask, ITaskFilter } from './constants/interfaces';

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
    const { title, description, priority, assign_to } = data;
    const task = this.repository.create({
      title,
      description,
      priority,
      assigned_to: assign_to || null
    }); 

    try {
      return await this.repository.save(task);
    } catch (err) {
      throw new InternalServerErrorException('Failed to create a task');
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
      queryBuilder.andWhere({ assigned_to: owner });
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
    
    return { tasks, count};
  }
}
