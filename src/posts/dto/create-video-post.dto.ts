import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoPostDto {
  @ApiProperty({
    description: 'The title or caption of the video',
    example: 'My trip to Bali 🌴',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Optional description or content',
    example: 'Wait for the drop!',
  })
  @IsOptional()
  @IsString()
  content?: string;

  // ⚠️ Important for Swagger:
  // This tells Swagger to show a "File Upload" button.
  // We don't use @IsNotEmpty() here because Multer handles validation before the DTO is checked.
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Video file (MP4/MOV, max 50MB)',
  })
  @IsOptional()
  file: any;
}
