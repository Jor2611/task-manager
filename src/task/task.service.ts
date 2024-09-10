import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { ICreateTask } from './constants/interfaces';


@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly repository: Repository<Task>
  ){}

  async read(id: number){
    const task = await this.repository.findOneBy({ id });
    
    if(!task){
      throw new NotFoundException('TASK_NOT_FOUND');
    }

    return task;
  }

  async create(data: ICreateTask){
    const { title, description, priority, assign_to } = data;
    const task = this.repository.create({
      title,
      description,
      priority,
      assigned_to: assign_to || null
    }); 

    try{
      return await this.repository.save(task);
    }catch(err){
      throw new InternalServerErrorException('Failed to create task');
    }
  }
}
