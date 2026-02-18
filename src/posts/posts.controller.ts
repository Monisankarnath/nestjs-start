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
  BadRequestException,
} from '@nestjs/common';
import { extname } from 'path';
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
  ApiConsumes,
} from '@nestjs/swagger';
import { StreamService } from './providers/stream.service';
import { CreateVideoPostDto } from './dto/create-video-post.dto';
import { diskStorage } from 'multer';

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

  @Post('video')
  @ApiOperation({ summary: 'Upload a video post (Max 50MB)' })
  @ApiConsumes('multipart/form-data') // 👈 Tells Swagger this endpoint accepts files
  @UseInterceptors(
    FileInterceptor('file', {
      // 1. Storage Configuration: Save to ./uploads/temp folder
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          // Generate unique filename: timestamp-random.mp4
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      // 2. Constraints (50MB Limit)
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      // 3. File Filter (Security: Only MP4/MOV)
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(mp4|quicktime|mov)$/)) {
          return callback(
            new BadRequestException('Only MP4 and MOV files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async createVideoPost(
    @Body() createVideoDto: CreateVideoPostDto,
    @UploadedFile() file: Express.Multer.File,
    // @Req() req: any, // 👈 Unlock this when Auth is ready
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    console.log('📂 Video uploaded to:', file.path);

    // HARDCODED USER ID for testing (Replace with req.user.id later)
    const testUserId = '9049e518-0b0a-40b9-8bbd-7b75d06e959f';

    return this.postsService.createVideoPost(createVideoDto, file, testUserId);
  }
}
