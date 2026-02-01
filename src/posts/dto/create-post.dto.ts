import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsEnum(PostType)
  type: PostType; // 'VIDEO' or 'IMAGE'

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Ensures every item inside the array is a string
  @Transform(({ value }) => {
    // FORM-DATA EDGE CASE HANDLING:
    // 1. If Postman sends "tech, coding", split it into ["tech", "coding"]
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }
    // 2. If it's already an array, just return it
    return value;
  })
  tags?: string[];
}
