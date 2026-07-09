export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string; // 'national' | 'politics' | 'economy' | 'sports' | 'entertainment' | 'tech' | 'opinion'
  imageUrl: string;
  date: string; // in BDT format or general date
  author: string;
  reads: number;
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  commentsCount: number;
  isUserSubmitted?: boolean;
}

export interface Comment {
  id: string;
  newsId: string;
  author: string;
  content: string;
  date: string;
}

export interface Poll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  userVotedOptionId?: string;
}

export interface CricketMatch {
  battingTeam: string;
  bowlingTeam: string;
  score: string;
  overs: string;
  target?: string;
  statusText: string;
  batsman: string;
  bowler: string;
}
