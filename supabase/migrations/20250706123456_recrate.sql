CREATE TABLE IF NOT EXISTS student_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  academic_year TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, academic_year)
);

INSERT INTO student_classes (student_id, class_id, academic_year, is_active)
SELECT
  s.id,
  s.class_id,
  '2024/2025' AS academic_year, -- or dynamically determine this if you have it
  TRUE
FROM students s
WHERE s.class_id IS NOT NULL;

ALTER TABLE payments RENAME TO payments_old;
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_class_id uuid REFERENCES student_classes(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  status payment_status NOT NULL DEFAULT 'unpaid',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO payments (
  student_class_id,
  amount,
  payment_date,
  month,
  year,
  status,
  notes,
  created_at,
  updated_at
)
SELECT
  sc.id,
  p.amount,
  p.payment_date,
  p.month,
  p.year,
  p.status,
  p.notes,
  p.created_at,
  p.updated_at
FROM payments_old p
JOIN student_classes sc ON sc.student_id = p.student_id
WHERE sc.academic_year = '2024/2025';