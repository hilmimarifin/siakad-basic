/*
  # Initial School Information System Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (enum: admin, principal, teacher)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `classes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `grade_level` (text)
      - `homeroom_teacher_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `students`
      - `id` (uuid, primary key)
      - `student_id` (text, unique)
      - `full_name` (text)
      - `date_of_birth` (date)
      - `gender` (enum: male, female)
      - `address` (text)
      - `phone` (text, nullable)
      - `parent_name` (text)
      - `parent_phone` (text)
      - `class_id` (uuid, foreign key to classes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `payments`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `amount` (decimal)
      - `payment_date` (date)
      - `month` (text)
      - `year` (integer)
      - `status` (enum: paid, unpaid, partial)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'principal', 'teacher');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE payment_status AS ENUM ('paid', 'unpaid', 'partial');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'teacher',
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade_level text NOT NULL,
  homeroom_teacher_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender gender_type NOT NULL,
  address text NOT NULL,
  phone text,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  status payment_status NOT NULL DEFAULT 'unpaid',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only principals can insert users" ON users FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'principal'
  )
);
CREATE POLICY "Only principals can update users" ON users FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'principal'
  )
);

-- Create policies for classes table
CREATE POLICY "Users can read all classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Only principals can manage classes" ON classes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'principal'
  )
);

-- Create policies for students table
CREATE POLICY "Users can read all students" ON students FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage students" ON students FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'principal', 'teacher')
  )
);

-- Create policies for payments table
CREATE POLICY "Users can read all payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage payments" ON payments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('admin', 'principal', 'teacher')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_classes_homeroom_teacher ON classes(homeroom_teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Insert default users (passwords are hashed versions of the demo passwords)
INSERT INTO users (email, password_hash, role, full_name) VALUES
  ('admin@school.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', 'admin', 'System Administrator'),
  ('principal@school.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', 'principal', 'School Principal'),
  ('teacher@school.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', 'teacher', 'John Teacher')
ON CONFLICT (email) DO NOTHING;