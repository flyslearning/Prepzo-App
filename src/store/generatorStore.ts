import { create } from "zustand";
import { GeneratorApi } from "../api/generatorApi";
import {
  Chapter,
  DppListItem,
  LeaderboardItem,
  Mistake,
  NotificationItem,
  Question,
  Subject,
  Subtopic,
  TestListItem,
  Topic,
} from "../types/generator";

type GeneratorState = {
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  subtopics: Subtopic[];

  tests: TestListItem[];
  dpps: DppListItem[];
  mistakes: Mistake[];
  bookmarks: Question[];
  notifications: NotificationItem[];
  leaderboard: LeaderboardItem[];

  loading: boolean;

  loadSubjects: () => Promise<void>;
  loadChapters: (subjectId: string) => Promise<void>;
  loadTopics: (chapterId: string) => Promise<void>;
  loadSubtopics: (topicId: string) => Promise<void>;

  loadMyTests: () => Promise<void>;
  loadMyDpps: () => Promise<void>;
  loadMistakes: (status?: "PENDING" | "IMPROVED") => Promise<void>;
  loadBookmarks: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;

  resetGenerator: () => void;
};

export const useGeneratorStore = create<GeneratorState>((set) => ({
  subjects: [],
  chapters: [],
  topics: [],
  subtopics: [],

  tests: [],
  dpps: [],
  mistakes: [],
  bookmarks: [],
  notifications: [],
  leaderboard: [],

  loading: false,

  loadSubjects: async () => {
    set({ loading: true });
    try {
      const res = await GeneratorApi.getSubjects();
      set({ subjects: res.data.subjects || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadChapters: async (subjectId) => {
    set({ loading: true, chapters: [], topics: [], subtopics: [] });
    try {
      const res = await GeneratorApi.getChapters(subjectId);
      set({ chapters: res.data.chapters || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadTopics: async (chapterId) => {
    set({ loading: true, topics: [], subtopics: [] });
    try {
      const res = await GeneratorApi.getTopics(chapterId);
      set({ topics: res.data.topics || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadSubtopics: async (topicId) => {
    set({ loading: true, subtopics: [] });
    try {
      const res = await GeneratorApi.getSubtopics(topicId);
      set({ subtopics: res.data.subtopics || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadMyTests: async () => {
    set({ loading: true });
    try {
      const res = await GeneratorApi.getMyTests();
      set({ tests: res.data.tests || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadMyDpps: async () => {
    set({ loading: true });
    try {
      const res = await GeneratorApi.getMyDpps();
      set({ dpps: res.data.dpps || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadMistakes: async (status) => {
    set({ loading: true });
    try {
      const res = await GeneratorApi.getMistakes(status);
      set({ mistakes: res.data.mistakes || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadBookmarks: async () => {
    set({ loading: true });
    try {
      const res = await GeneratorApi.getBookmarks();
      set({ bookmarks: res.data.questions || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadNotifications: async () => {
    set({ loading: true });
    try {
      const res = await GeneratorApi.getNotifications();
      set({ notifications: res.data.notifications || [] });
    } finally {
      set({ loading: false });
    }
  },

  loadLeaderboard: async () => {
    set({ loading: true });
    try {
      const res = await GeneratorApi.getLeaderboard(100);
      set({ leaderboard: res.data.leaderboard || [] });
    } finally {
      set({ loading: false });
    }
  },

  resetGenerator: () => {
    set({
      subjects: [],
      chapters: [],
      topics: [],
      subtopics: [],
      tests: [],
      dpps: [],
      mistakes: [],
      bookmarks: [],
      notifications: [],
      leaderboard: [],
      loading: false,
    });
  },
}));