import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @MinLength(5, { message: 'Description is too short!' })
  description: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
