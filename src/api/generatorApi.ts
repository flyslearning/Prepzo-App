import { generatorClient } from "./generatorClient";
import {
  AttemptResult,
  Chapter,
  DppListItem,
  DppPreviewPayload,
  LeaderboardItem,
  Mistake,
  NotificationItem,
  Question,
  Subject,
  Subtopic,
  TestListItem,
  TestPreviewPayload,
  Topic,
} from "../types/generator";

export const GeneratorApi = {
  health() {
    return generatorClient.get("/health");
  },

  getSharedTest(token: string) {
    return generatorClient.get<{
      questions: Question[];
    }>(`/shared-tests/${token}`);
  },

  getSubjects() {
    return generatorClient.get<{
      subjects: Subject[];
    }>("/subjects");
  },

  getChapters(subjectId: string) {
    return generatorClient.get<{
      chapters: Chapter[];
    }>(`/subjects/${subjectId}/chapters`);
  },

  getTopics(chapterId: string) {
    return generatorClient.get<{
      topics: Topic[];
    }>(`/chapters/${chapterId}/topics`);
  },

  getSubtopics(topicId: string) {
    return generatorClient.get<{
      subtopics: Subtopic[];
    }>(`/topics/${topicId}/subtopics`);
  },

  generateTestPreview(payload: TestPreviewPayload) {
    return generatorClient.post<{
      test_id: string;
      status: string;
      questions: Question[];
    }>("/tests/preview", payload);
  },

  generateLiveAiTestPreview(payload: any) {
    return generatorClient.post<{
      test_id: string;
      status: string;
      questions: Question[];
    }>("/tests/live-ai-preview", payload);
  },

  saveTest(testId: string) {
    return generatorClient.post<{
      message: string;
    }>(`/tests/${testId}/save`);
  },

  startTest(testId: string) {
    return generatorClient.post<{
      attempt_id: string;
    }>(`/tests/${testId}/start`);
  },

  saveTestAnswer(
    attemptId: string,
    payload: {
      question_id: string;
      selected_option: string;
    }
  ) {
    return generatorClient.post<{
      message: string;
    }>(`/attempts/${attemptId}/answers`, payload);
  },

  autosaveAttempt(
    attemptId: string,
    payload: {
      answers_json: Record<string, string>;
      remaining_seconds: number;
    }
  ) {
    return generatorClient.post<{
      message: string;
    }>(`/attempts/${attemptId}/autosave`, payload);
  },

  submitTest(attemptId: string) {
    return generatorClient.post<{
      message: string;
    }>(`/attempts/${attemptId}/submit`);
  },

  submitTestAdvanced(attemptId: string) {
    return generatorClient.post<{
      message: string;
    }>(`/attempts/${attemptId}/submit-advanced`);
  },

  getMyTests() {
    return generatorClient.get<{
      tests: TestListItem[];
    }>("/tests");
  },

  getTestDetail(testId: string) {
    return generatorClient.get<{
      questions: Question[];
    }>(`/tests/${testId}`);
  },

  getAttemptResult(attemptId: string) {
    return generatorClient.get<AttemptResult>(
      `/attempts/${attemptId}/result`
    );
  },

  updateTestMarking(
    testId: string,
    payload: {
      per_question_marks: number;
      negative_marks: number;
    }
  ) {
    return generatorClient.put<{
      message: string;
    }>(`/tests/${testId}/marking`, payload);
  },

  shareTest(
    testId: string,
    payload: {
      is_public: boolean;
      expires_at: string;
    }
  ) {
    return generatorClient.post<{
      share_token: string;
      share_url: string;
    }>(`/tests/${testId}/share`, payload);
  },

  getTestPdfUrl(testId: string) {
    return `${generatorClient.defaults.baseURL}/tests/${testId}/pdf`;
  },

  generateWeakChapterTest(payload: {
    total_questions: number;
    time_minutes: number;
    per_question_marks: number;
    negative_marks: number;
  }) {
    return generatorClient.post<{
      test_id: string;
      title: string;
      status: string;
      questions: Question[];
    }>("/tests/weak-chapter", payload);
  },

  generateAiPerformanceReport(attemptId: string) {
    return generatorClient.post<{
      report: {
        summary: string;
        strong_areas: string[];
        weak_areas: string[];
        next_steps: string[];
      };
    }>(`/attempts/${attemptId}/ai-report`);
  },

  getMyDpps() {
    return generatorClient.get<{
      dpps: DppListItem[];
    }>("/dpps");
  },

  getDppDetail(dppId: string) {
    return generatorClient.get<{
      questions: Question[];
    }>(`/dpps/${dppId}`);
  },

  generateDppPreview(payload: DppPreviewPayload) {
    return generatorClient.post<{
      dpp_id: string;
      status: string;
      questions: Question[];
    }>("/dpps/preview", payload);
  },

  generateAdaptiveDpp(payload: {
    total_questions: number;
    time_minutes: number;
  }) {
    return generatorClient.post<{
      dpp_id: string;
      reason: string;
      questions: Question[];
    }>("/dpps/adaptive", payload);
  },

  saveDpp(dppId: string) {
    return generatorClient.post<{
      message: string;
    }>(`/dpps/${dppId}/save`);
  },

  submitDppAnswer(
    dppId: string,
    payload: {
      question_id: string;
      selected_option: string;
    }
  ) {
    return generatorClient.post<{
      question_id: string;
      selected_option: string;
      correct_option: string;
      is_correct: boolean;
      explanation: string;
    }>(`/dpps/${dppId}/answer`, payload);
  },

  getMistakes(status?: "PENDING" | "IMPROVED") {
    return generatorClient.get<{
      mistakes: Mistake[];
    }>("/mistakes", {
      params: status ? { status } : undefined,
    });
  },

  improveMistake(mistakeId: string) {
    return generatorClient.post<{
      message: string;
    }>(`/mistakes/${mistakeId}/improve`);
  },

  solveMistake(
    mistakeId: string,
    payload: {
      solved_answer: string;
    }
  ) {
    return generatorClient.post<{
      message: string;
    }>(`/mistakes/${mistakeId}/solve`, payload);
  },

  bookmarkQuestion(questionId: string) {
    return generatorClient.post<{
      message: string;
    }>("/bookmarks", {
      question_id: questionId,
    });
  },

  getBookmarks() {
    return generatorClient.get<{
      questions: Question[];
    }>("/bookmarks");
  },

  createRevisionFolder(name: string) {
    return generatorClient.post<{
      folder_id: string;
    }>("/revision-folders", {
      name,
    });
  },

  addQuestionToRevisionFolder(folderId: string, questionId: string) {
    return generatorClient.post<{
      message: string;
    }>(`/revision-folders/${folderId}/questions`, {
      question_id: questionId,
    });
  },

  joinBatch(batchCode: string) {
    return generatorClient.post<{
      message: string;
    }>("/batches/join", {
      batch_code: batchCode,
    });
  },

  searchQuestions(params: {
    goal_id?: string;
    class_id?: string;
    subject_id?: string;
    chapter_id?: string;
    topic_id?: string;
    subtopic_id?: string;
    source?: "DB" | "AI";
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    keyword?: string;
    page?: number;
    limit?: number;
  }) {
    return generatorClient.get<{
      questions: Question[];
    }>("/questions/search", {
      params,
    });
  },

  getNotifications() {
    return generatorClient.get<{
      notifications: NotificationItem[];
    }>("/notifications");
  },

  getLeaderboard(limit = 100) {
    return generatorClient.get<{
      leaderboard: LeaderboardItem[];
    }>("/leaderboard", {
      params: { limit },
    });
  },
};