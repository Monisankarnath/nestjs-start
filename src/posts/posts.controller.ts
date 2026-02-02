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
  UseGuards,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { GetPostDto } from './dto/get-posts.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StreamService } from './providers/stream.service';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly streamService: StreamService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createPostDto: CreatePostDto,
    @GetUser('userId') userId: string,
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
    return this.postsService.create(createPostDto, userId, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with pagination' }) // Description
  @ApiResponse({ status: 200, description: 'Return all posts.' })
  findAll(@Query() query: GetPostDto) {
    return this.postsService.findAll(query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.postsService.remove(id, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiResponse({ status: 200, description: 'Return the post.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async findOne(@Param('id') id: string) {
    // 1. Get the data for the user (Fast)
    const post = await this.postsService.findOne(id);

    // 2. Log the analytic (Async / Side Effect)
    // Notice we don't "await" this strictly if we want the user response to be instant.
    // However, in Node, it's safer to handle errors.
    this.streamService.pushLog('anonymous_user', +id);

    return post;
  }
}
