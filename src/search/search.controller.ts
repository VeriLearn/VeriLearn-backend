import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('courses')
  @ApiOperation({ summary: 'Full-text search courses' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'from', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  searchCourses(
    @Query('q') q: string,
    @Query('from') from = 0,
    @Query('size') size = 10,
  ) {
    return this.searchService.searchCourses(q, +from, +size);
  }
}
