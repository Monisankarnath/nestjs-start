import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Logger,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    this.logger.log(`Creating a new task: ${JSON.stringify(createTaskDto)}`);
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    this.logger.log(
      `Getting all tasks, length: ${this.tasksService.findAll().length}`,
    );
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Getting task with id: ${id}`);
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    this.logger.log(
      `Updating task with id: ${id}, data: ${JSON.stringify(updateTaskDto)}`,
    );
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    this.logger.log(
      `Updating task with id: ${id}, data: ${JSON.stringify(updateTaskDto)}`,
    );
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Removing task with id: ${id}`);
    return this.tasksService.remove(id);
  }
}
