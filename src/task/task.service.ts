import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { ICreateTask } from './constants/interfaces';


@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly repository: Repository<Task>
  ){}

  async create(data: ICreateTask){
    const { title, description, priority, assign_to } = data;
    const task = this.repository.create({
      title,
      description,
      priority,
      assigned_to: assign_to || null
    });

    return await this.repository.save(task);
  }
}
