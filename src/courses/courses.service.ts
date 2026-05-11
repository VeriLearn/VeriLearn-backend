import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, Lesson, Enrollment, CourseStatus } from './entities/course.entity';
import { CreateCourseDto, UpdateCourseDto, CreateLessonDto } from './dto/course.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private readonly courseRepo: Repository<Course>,
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async create(dto: CreateCourseDto, instructorId: string): Promise<Course> {
    const course = this.courseRepo.create({ ...dto, instructorId });
    return this.courseRepo.save(course);
  }

  async findAll(published = true): Promise<Course[]> {
    const where = published ? { status: CourseStatus.PUBLISHED } : {};
    return this.courseRepo.find({ where, relations: ['instructor'] });
  }

  async findById(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({ where: { id }, relations: ['instructor', 'lessons'] });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, dto: UpdateCourseDto, userId: string, role: UserRole): Promise<Course> {
    const course = await this.findById(id);
    if (course.instructorId !== userId && role !== UserRole.ADMIN) throw new ForbiddenException();
    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  async remove(id: string, userId: string, role: UserRole): Promise<void> {
    const course = await this.findById(id);
    if (course.instructorId !== userId && role !== UserRole.ADMIN) throw new ForbiddenException();
    await this.courseRepo.remove(course);
  }

  async addLesson(courseId: string, dto: CreateLessonDto, userId: string, role: UserRole): Promise<Lesson> {
    const course = await this.findById(courseId);
    if (course.instructorId !== userId && role !== UserRole.ADMIN) throw new ForbiddenException();
    const lesson = this.lessonRepo.create({ ...dto, courseId });
    return this.lessonRepo.save(lesson);
  }

  async enroll(courseId: string, userId: string): Promise<Enrollment> {
    const course = await this.findById(courseId);
    if (course.status !== CourseStatus.PUBLISHED) throw new ForbiddenException('Course not available');
    const existing = await this.enrollmentRepo.findOne({ where: { courseId, userId } });
    if (existing) throw new ConflictException('Already enrolled');
    const enrollment = this.enrollmentRepo.create({ courseId, userId });
    await this.courseRepo.increment({ id: courseId }, 'enrollmentCount', 1);
    return this.enrollmentRepo.save(enrollment);
  }

  async getEnrollments(userId: string): Promise<Enrollment[]> {
    return this.enrollmentRepo.find({ where: { userId } });
  }

  async completeCourse(courseId: string, userId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({ where: { courseId, userId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();
    return this.enrollmentRepo.save(enrollment);
  }
}
