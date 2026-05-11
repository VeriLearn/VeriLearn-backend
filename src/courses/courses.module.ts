import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Lesson, Enrollment } from './entities/course.entity';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lesson, Enrollment])],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
