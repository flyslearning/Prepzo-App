import type {
  NavigatorScreenParams,
} from "@react-navigation/native";


export type BottomTabParamList = {
  Home: undefined;

  Test: undefined;

  Swipe: undefined;

  Dpp: undefined;

  Profile: undefined;
};


export type AppStackParamList = {
  /*
  |--------------------------------------------------------------------------
  | Main Bottom Navigation
  |--------------------------------------------------------------------------
  */

  MainTabs:
    NavigatorScreenParams<BottomTabParamList>
    | undefined;


  /*
  |--------------------------------------------------------------------------
  | Compatibility Routes
  |--------------------------------------------------------------------------
  |
  | Ye HomeScreen / ProfileScreen ke existing navigation typings
  | ko break hone se bachane ke liye rakhe gaye hain.
  |
  */

  Home: undefined;

  Profile: undefined;


  /*
  |--------------------------------------------------------------------------
  | Profile
  |--------------------------------------------------------------------------
  */

  Sessions: undefined;


  /*
  |--------------------------------------------------------------------------
  | Tests
  |--------------------------------------------------------------------------
  */

  CreateTest: undefined;

  MyTests: undefined;

  TestAttempt: {
    testId: string;

    preview?: boolean;

    questions?: any[];

    timeMinutes?: number;
  };

  Result: {
    attemptId: string;
  };


  /*
  |--------------------------------------------------------------------------
  | DPP
  |--------------------------------------------------------------------------
  */

  CreateDpp: undefined;

  MyDpps: undefined;

  DppAttempt: {
    dppId: string;

    questions: any[];
  };


  /*
  |--------------------------------------------------------------------------
  | Practice / Generator
  |--------------------------------------------------------------------------
  */

  Mistakes: undefined;

  Bookmarks: undefined;

  Notifications: undefined;

  Leaderboard: undefined;

  JoinBatch: undefined;

  SearchQuestions: undefined;

  RevisionFolder: undefined;

  SharedTest: undefined;

  AdvancedGenerator: undefined;

  Nova: undefined;
  Settings: undefined;
};