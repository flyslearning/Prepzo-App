export type ID = string;

export type Subject = {
  id: ID;
  name: string;
};

export type Chapter = {
  id: ID;
  name: string;
};

export type Topic = {
  id: ID;
  name: string;
};

export type Subtopic = {
  id: ID;
  name: string;
};

export type Question = {
  id: ID;
  question_source?: string;
  question_text: string;
  image_url?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  source?: string;
};

export type TestPreviewPayload = {
  mode: "ai" | "db" | "both";
  ai_percentage: number;
  db_percentage: number;
  subject_ids: ID[];
  chapter_ids: ID[];
  topic_ids: ID[];
  subtopic_ids: ID[];
  total_questions: number;
  time_minutes: number;
  per_question_marks: number;
  negative_marks: number;
};

export type DppPreviewPayload = {
  mode: "ai" | "db" | "both";
  ai_percentage: number;
  db_percentage: number;
  subject_ids: ID[];
  chapter_ids: ID[];
  topic_ids: ID[];
  subtopic_ids: ID[];
  total_questions: number;
  time_minutes: number;
};

export type TestListItem = {
  id: ID;
  title: string;
  mode: string;
  total_questions: number;
  time_minutes: number;
  status: string;
  created_at: string;
};

export type DppListItem = {
  id: ID;
  title: string;
  mode: string;
  total_questions: number;
  status: string;
  created_at: string;
};

export type AttemptResult = {
  attempt_id: ID;
  score: number;
  total: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  questions: Array<{
    question_id: ID;
    question_text: string;
    image_url?: string;
    selected_option?: string;
    correct_option: string;
    is_correct: boolean;
    explanation?: string;
  }>;
};

export type Mistake = {
  id: ID;
  question_id: ID;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  status: "PENDING" | "IMPROVED" | string;
};

export type NotificationItem = {
  id: ID;
  title: string;
  body: string;
  type: string;
  read: boolean;
};

export type LeaderboardItem = {
  rank: number;
  user_id: ID;
  score: number;
  total_tests: number;
  avg_accuracy: number;
};