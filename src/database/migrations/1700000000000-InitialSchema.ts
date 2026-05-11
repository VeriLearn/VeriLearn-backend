import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('student', 'instructor', 'admin');
      CREATE TYPE "course_status_enum" AS ENUM ('draft', 'published', 'archived');
      CREATE TYPE "course_level_enum" AS ENUM ('beginner', 'intermediate', 'advanced');

      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar UNIQUE NOT NULL,
        "firstName" varchar NOT NULL,
        "lastName" varchar NOT NULL,
        "password" varchar NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'student',
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "mfaSecret" varchar,
        "isMfaEnabled" boolean NOT NULL DEFAULT false,
        "stellarPublicKey" varchar,
        "avatarUrl" varchar,
        "emailVerificationToken" varchar,
        "passwordResetToken" varchar,
        "passwordResetExpires" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE "courses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "thumbnailUrl" varchar,
        "status" "course_status_enum" NOT NULL DEFAULT 'draft',
        "level" "course_level_enum" NOT NULL DEFAULT 'beginner',
        "price" decimal(10,2) NOT NULL DEFAULT 0,
        "category" varchar,
        "tags" text,
        "instructorId" uuid REFERENCES "users"("id"),
        "enrollmentCount" int NOT NULL DEFAULT 0,
        "credentialContractId" varchar,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE "lessons" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "description" text,
        "videoUrl" varchar,
        "duration" int,
        "order" int NOT NULL DEFAULT 0,
        "isFree" boolean NOT NULL DEFAULT false,
        "courseId" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE "enrollments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL REFERENCES "users"("id"),
        "courseId" uuid NOT NULL REFERENCES "courses"("id"),
        "isCompleted" boolean NOT NULL DEFAULT false,
        "completedAt" timestamptz,
        "credentialTxHash" varchar,
        "enrolledAt" timestamptz NOT NULL DEFAULT now(),
        UNIQUE("userId", "courseId")
      );

      CREATE TABLE "credentials" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "courseId" uuid NOT NULL,
        "stellarPublicKey" varchar NOT NULL,
        "txHash" varchar,
        "contractId" varchar,
        "ledger" int,
        "isVerified" boolean NOT NULL DEFAULT false,
        "metadata" text,
        "issuedAt" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid,
        "action" varchar NOT NULL,
        "resource" varchar NOT NULL,
        "resourceId" varchar,
        "ipAddress" varchar,
        "userAgent" varchar,
        "metadata" text,
        "success" boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX "idx_audit_logs_userId" ON "audit_logs"("userId");
      CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");
      CREATE INDEX "idx_audit_logs_createdAt" ON "audit_logs"("createdAt");
      CREATE INDEX "idx_courses_status" ON "courses"("status");
      CREATE INDEX "idx_enrollments_userId" ON "enrollments"("userId");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "audit_logs";
      DROP TABLE IF EXISTS "credentials";
      DROP TABLE IF EXISTS "enrollments";
      DROP TABLE IF EXISTS "lessons";
      DROP TABLE IF EXISTS "courses";
      DROP TABLE IF EXISTS "users";
      DROP TYPE IF EXISTS "course_level_enum";
      DROP TYPE IF EXISTS "course_status_enum";
      DROP TYPE IF EXISTS "user_role_enum";
    `);
  }
}
