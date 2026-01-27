import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  create(createTaskDto: CreateTaskDto) {
    const task: Task = {
      id: crypto.randomUUID(),
      ...createTaskDto,
      status: 'OPEN',
    };
    this.tasks.push(task);
    return task;
  }

  findAll() {
    return this.tasks;
  }

  findOne(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = this.findOne(id);
    const index = this.tasks.findIndex((t) => t.id === id);
    const updatedTask = { ...task, ...updateTaskDto };
    this.tasks[index] = updatedTask;
    return updatedTask;
  }

  remove(id: string) {
    const task = this.findOne(id);
    this.tasks = this.tasks.filter((t) => t.id !== task.id);
    return null;
  }
}
