import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createPostDto: CreatePostDto,

    // Strict File Validation
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // Max 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|mp4)$/ }), // Regex for types
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = 'b3240264-6d8f-462b-bd2a-7eb9395704fd';

    return this.postsService.create(createPostDto, userId, file);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }
}
