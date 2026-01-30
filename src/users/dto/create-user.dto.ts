import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required!' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Username is required!' })
  password: string;
}
