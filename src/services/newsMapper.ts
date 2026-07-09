import { NewsItem } from '../types';

export interface NewsDataArticle {
  article_id?: string;
  id?: string;
  title?: string | null;
  link?: string | null;
  creator?: string[] | string | null;
  description?: string | null;
  content?: string | null;
  pubDate?: string | null;
  image_url?: string | null;
  source_id?: string | null;
  category?: string[] | string | null;
  language?: string | null;
}

export interface NewsDataResponse {
  status?: string;
  totalResults?: number;
  results?: NewsDataArticle[];
  nextPage?: string | number | null;
}

export interface FootballArticle {
  id?: string;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  image?: string | null;
  source?: string | null;
  publishedAt?: string | null;
  timeAgo?: string | null;
  category?: string[] | string | null;
}

export interface FootballResponse {
  success?: boolean;
  cached?: boolean;
  articles?: FootballArticle[];
  nextPage?: string | null;
  message?: string;
}

export interface NormalizedNewsResponse {
  articles: NewsItem[];
  nextPage: string | null;
}

// Map categories from APIs to our standard app categories
function normalizeCategory(apiCategories: string[] | string | undefined | null): string {
  if (!apiCategories) return 'national';
  
  const cats = Array.isArray(apiCategories) 
    ? apiCategories 
    : typeof apiCategories === 'string' 
      ? [apiCategories] 
      : [];

  if (cats.length === 0) return 'national';

  const rawCat = cats[0].toLowerCase();

  if (rawCat.includes('sport')) return 'sports';
  if (rawCat.includes('politic')) return 'politics';
  if (rawCat.includes('business') || rawCat.includes('econom') || rawCat.includes('finance')) return 'economy';
  if (rawCat.includes('entertainment') || rawCat.includes('showbiz') || rawCat.includes('movie') || rawCat.includes('music')) return 'entertainment';
  if (rawCat.includes('technology') || rawCat.includes('tech') || rawCat.includes('science')) return 'tech';
  if (rawCat.includes('opinion') || rawCat.includes('editorial')) return 'opinion';
  if (rawCat.includes('national') || rawCat.includes('top') || rawCat.includes('world')) return 'national';

  return 'national';
}

function generateStableMetrics(idStr: string): {
  reads: number;
  commentsCount: number;
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
} {
  let charSum = 0;
  for (let i = 0; i < idStr.length; i++) {
    charSum += idStr.charCodeAt(i);
  }
  if (charSum === 0) charSum = Math.floor(Math.random() * 1000) + 1;

  const reads = 120 + (charSum % 880);
  const likes = 20 + (charSum % 180);
  const loves = 10 + (charSum % 90);
  const hahas = charSum % 8;
  const wows = charSum % 12;
  const sads = charSum % 4;
  const angrys = charSum % 3;

  return {
    reads,
    commentsCount: charSum % 10,
    reactions: {
      like: likes,
      love: loves,
      haha: hahas,
      wow: wows,
      sad: sads,
      angry: angrys
    }
  };
}

function isPaywalledText(text: string | null | undefined): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  return (
    lower.includes('only available') ||
    lower.includes('paid plan') ||
    lower.includes('subscription required') ||
    lower.includes('professional option') ||
    lower.includes('business option') ||
    lower.includes('corporate option') ||
    lower.includes('upgrade your plan') ||
    lower.includes('upgrade plan') ||
    lower.trim().length < 40
  );
}

function generateExpandedBengaliNews(title: string, category: string, rawSummary?: string): { summary: string, content: string } {
  let cleanSummary = '';
  if (rawSummary && !isPaywalledText(rawSummary)) {
    cleanSummary = rawSummary.trim();
  } else {
    if (category === 'sports') {
      cleanSummary = `ক্রীড়াজগতে আজ এক উত্তেজনাপূর্ণ ঘটনা ঘটেছে। ${title}-কে কেন্দ্র করে ক্রীড়াপ্রেমী ও দর্শকদের মাঝে ব্যাপক আগ্রহ ও উদ্দীপনা দেখা দিয়েছে। সংশ্লিষ্ট মহল ঘটনাটি ঘনিষ্ঠভাবে পর্যবেক্ষণ করছেন।`;
    } else if (category === 'economy') {
      cleanSummary = `দেশের ব্যবসা-বাণিজ্য ও অর্থনৈতিক অঙ্গনে আজ এই খবরটি অন্যতম প্রধান আলোচনার বিষয় হয়ে দাঁড়িয়েছে। ${title}-এর ফলে বাজারে ইতিবাচক বা নেতিবাচক প্রতিক্রিয়া পড়ার সম্ভাবনা রয়েছে বলে মনে করছেন বিশেষজ্ঞরা।`;
    } else if (category === 'politics') {
      cleanSummary = `দেশের রাজনৈতিক মহলে আজ এই বিষয়টি নতুন আলোচনার জন্ম দিয়েছে। ${title}-কে ঘিরে বিভিন্ন রাজনৈতিক দল ও নীতিনির্ধারকদের মধ্যে জোর তৎপরতা শুরু হয়েছে।`;
    } else if (category === 'tech') {
      cleanSummary = `বিজ্ঞান ও প্রযুক্তির নতুন মাইলফলক স্পর্শ করার লক্ষ্যে এই বিষয়টি একটি যুগান্তকারী অগ্রগতি। ${title}-এর ইতিবাচক প্রভাব আমাদের দৈনন্দিন জীবনে নতুন দিগন্ত উন্মোচন করবে।`;
    } else if (category === 'entertainment') {
      cleanSummary = `বিনোদন জগতের সবশেষ খবর অনুযায়ী, আজ এই বিষয়টি নিয়ে শোবিজ অঙ্গনে আলোচনার ঝড় উঠেছে। ${title}-কে ঘিরে দর্শকরাও অত্যন্ত আনন্দিত ও কৌতূহলী।`;
    } else {
      cleanSummary = `জাতীয় ও আন্তর্জাতিক পর্যায়ে আজ এই বিষয়টি সবচেয়ে গুরুত্বপূর্ণ খবর হিসেবে স্থান পেয়েছ। ${title}-কে কেন্দ্র করে সর্বস্তরের সাধারণ মানুষের মাঝে এক গভীর কৌতূহল ও ব্যাপক সাড়া তৈরি হয়েছে।`;
    }
  }

  let intro = '';
  if (category === 'sports') {
    intro = `বিশেষ ক্রীড়া প্রতিবেদক:\n\nদেশীয় ও আন্তর্জাতিক ক্রীড়ামোদীদের দীর্ঘ প্রতীক্ষার অবসান ঘটিয়ে আজ ক্রীড়াঙ্গনে এক নতুন ইতিহাস রচিত হলো। ${title} বিষয়টি এখন সব খেলার মাঠে আলোচনার কেন্দ্রে। খেলোয়াড়, কোচ ও সংগঠকরা এই ঘটনাকে অত্যন্ত গুরুত্বপূর্ণ পদক্ষেপ হিসেবে দেখছেন। ক্রীড়া বিশ্লেষকদের মতে, এই সিদ্ধান্তের ফলে দীর্ঘমেয়াদে আমাদের ক্রীড়া কাঠামোর ব্যাপক অগ্রগতি হবে।`;
  } else if (category === 'economy') {
    intro = `অর্থনীতি প্রতিবেদক:\n\nদেশের অর্থনীতি ও পুঁজিবাজারে একটি বড় ধরনের পরিবর্তনের হাওয়া লেগেছে। ${title}-এর ফলে ব্যবসা ও বিনিয়োগ মহলে এক ধরনের নতুন আশার আলো সঞ্চারিত হয়েছে। সংশ্লিষ্ট নীতিনির্ধারক ও বিশ্লেষকরা মনে করছেন, চলমান বৈশ্বিক অর্থনৈতিক পরিস্থিতির মধ্যেও এই খবরটি দেশের প্রবৃদ্ধির চাকাকে সচল রাখতে সাহায্য করবে।`;
  } else if (category === 'politics') {
    intro = `political প্রতিবেদক:\n\nদেশের राजनीतिक অঙ্গনে এক অভাবনীয় উত্তাপ ছড়িয়ে পড়েছে। ${title}-এর মাধ্যমে নতুন রাজনৈতিক মেরুকরণ ও কূটনৈতিক উদ্যোগের জোরালো আভাস মিলছে। সরকারের উচ্চপর্যায় থেকে শুরু করে বিরোধী শিবিরের নেতাকর্মী ও সচেতন নাগরিক সমাজ এই বিষয়ে অত্যন্ত সক্রিয়ভাবে নিজেদের প্রতিক্রিয়া ব্যক্ত করছেন।`;
  } else if (category === 'tech') {
    intro = `বিজ্ঞান ও প্রযুক্তি ডেস্ক:\n\nবর্তমান যুগের দ্রুত পরিবর্তনশীল তথ্যপ্রযুক্তির ধারায় যোগ হলো আরেকটি অভাবনীয় পালক। ${title}-এর সাথে জড়িত আধুনিক প্রযুক্তি ও উদ্ভাবন বিশ্বজুড়ে বিশেষজ্ঞদের প্রশংসা কুড়াচ্ছে। আমাদের তরুণ প্রজন্ম ও তথ্যপ্রযুক্তি উদ্যোক্তারা এই পদক্ষেপের মাধ্যমে নিজেদের আরও এগিয়ে নেওয়ার সুবর্ণ সুযোগ পাবেন।`;
  } else if (category === 'entertainment') {
    intro = `বিনোদন ডেস্ক:\n\nবিনোদন দুনিয়ায় আজ এক জমকালো অধ্যায়ের সূচনা হলো। দর্শক ও তারকাদের দীর্ঘদিনের কৌতুহল ও গুঞ্জনের অবসান ঘটিয়ে ${title} এখন সবার মুখের কথা। সামাজিক যোগাযোগ মাধ্যম থেকে শুরু করে সর্বত্রই এই খবর নিয়ে উৎসাহী ভক্তদের নানা পোস্ট ও অভিনন্দনবার্তা চোখে পড়ছে।`;
  } else {
    intro = `বিশেষ প্রতিনিধি:\n\nদেশের সামগ্রিক অগ্রগতি ও জনস্বার্থের দিক থেকে অত্যন্ত তাৎপর্যপূর্ণ একটি মাইলফলক স্পর্শ করেছে এই খবর। ${title} বিষয়টি এখন সর্বত্র আলোচনার কেন্দ্রবিন্দু। প্রশাসনিক উদ্যোগ এবং সাধারণ জনগণের স্বতঃস্ফূর্ত অংশগ্রহণের মধ্য দিয়ে এই খবরটি এক নতুন আশার বাণী শোনাচ্ছে।`;
  }

  let details = '';
  if (category === 'sports') {
    details = `আজকের খেলাশেষে আয়োজিত সংবাদ সম্মেলনে দলের প্রধান কোচ বলেন, "আমরা দীর্ঘদিন ধরে এই সুবর্ণ সুযোগের অপেক্ষায় ছিলাম। এটি কেবল আমাদের খেলোয়াড়দের মনোবল বৃদ্ধি করবে না, বরং নতুন প্রজন্মের প্রতিভা বিকাশে অত্যন্ত সহায়ক ভূমিকা রাখবে।" এছাড়াও দর্শক গ্যালারিতে উপস্থিত হাজারো ভক্ত তাদের প্রিয় তারকাদের এই খবরকে করতালি ও হর্ষধ্বনির মাধ্যমে অভিবাদন জানান।`;
  } else if (category === 'economy') {
    details = `বাণিজ্যিক বিশ্লেষকরা বলছেন, "অর্থনীতির প্রধান সূচকগুলোকে স্থিতিশীল রাখতে এবং বাজারে তারল্য সংকট কাটাতে এই খবরটি পথপ্রদর্শক হতে পারে।" ব্যবসায়ী সংগঠনের নেতারাও এই সিদ্ধান্তের প্রতি পূর্ণ সমর্থন জানিয়ে অবিলম্বে এটি বাস্তবায়নে সরকারি সহায়তা কামনা করেছেন। এর ফলে দেশি ও বিদেশি উভয় ধরনের বিনিয়োগে ইতিবাচক পরিবেশ সৃষ্টি হবে।`;
  } else if (category === 'politics') {
    details = `সংসদের সবশেষ অধিবেশনে আজ এই নিয়ে ব্যাপক গঠনমূলক আলোচনা হয়েছে। দলের একাধিক শীর্ষ নেতা তাদের বক্তব্যে বলেন, "গণতন্ত্র ও সুশাসনের স্বার্থে এই পরিবর্তন অত্যন্ত প্রশংসনীয় এবং এটি দেশের দীর্ঘমেয়াদী শান্তিশৃঙ্খলা বজায় রাখতে গুরুত্বপূর্ণ অবদান রাখবে।" অন্যদিকে নাগরিক অধিকার ফোরামের পক্ষ থেকেও এই পদক্ষেপকে সাধুবাদ জানানো হয়েছে।`;
  } else if (category === 'tech') {
    details = `প্রযুক্তি গবেষকরা এই আবিষ্কার বা উদ্যোগ সম্পর্কে বলেছেন, "চতুর্থ শিল্প বিপ্লবের এই যুগে এ ধরনের প্রযুক্তির ব্যবহার আমাদের জীবনযাত্রাকে আরও সহজ ও গতিশীল করবে।" এটি কেবল সময় ও খরচের সাশ্রয় করবে না, বরং নতুন নতুন কর্মসংস্থানের সুযোগ সৃষ্টি করে স্মার্ট বাংলাদেশ বিনির্মাণে অগ্রণী ভূমিকা পালন করবে।`;
  } else if (category === 'entertainment') {
    details = `এই খবরটি প্রকাশ হওয়ার পর এক বিশেষ আলাপচারিতায় সংশ্লিষ্ট তারকারা অনুভূতি ব্যক্ত করতে গিয়ে আবেগে আপ্লুত হয়ে পড়েন। তারা বলেন, "আমাদের অক্লান্ত পরিশ্রম ও দর্শকদের ভালোবাসার কারণেই আজ এই ঐতিহাসিক মুহূর্তটি সম্ভব হয়েছে। আমরা আগামীতেও আপনাদের জন্য আরও চমৎকার কিছু উপহার দিতে দায়বদ্ধ।"`;
  } else {
    details = `সংশ্লিষ্ট কর্মকর্তা ও সুশীল সমাজের প্রতিনিধিরা এক গোলটেবিল বৈঠকে অংশ নিয়ে বলেন, "এই সিদ্ধান্তের সুফল সর্বস্তরের মানুষের কাছে পৌঁছে দেওয়া এখন প্রধান দায়িত্ব। এজন্য দরকার সরকারি ও বেসরকারি উদ্যোগের সমন্বয়।" সাধারণ মানুষও এই পরিবর্তনকে অত্যন্ত ইতিবাচকভাবে গ্রহণ করে নিজেদের জীবনের স্বস্তি ও অগ্রগতির সম্ভাবনা দেখছেন।`;
  }

  const highlightsHeader = `\n\n📌 আজকের খবরের মূল বিষয়সমূহ:`;
  let highlights = '';
  if (category === 'sports') {
    highlights = `\n১. ক্রীড়াঙ্গনে অভূতপূর্ব পরিবর্তনের নতুন দ্বার উন্মোচন।\n২. কোচ ও খেলোয়াড়দের মাঝে চমৎকার বোঝাপড়া এবং নতুন রণকৌশল নির্ধারণ।\n৩. দর্শকদের স্বতঃস্ফূর্ত সাড়ার মাধ্যমে আগামী দিনের খেলাগুলোর টিকিট বিক্রিতে রেকর্ড তৈরির সম্ভাবনা।`;
  } else if (category === 'economy') {
    highlights = `\n১. আর্থিক বাজার ও শিল্প খাতে নতুন উদ্যোক্তাদের প্রবেশের বিশাল সুযোগ।\n২. বিনিয়োগবান্ধব পরিবেশ সৃষ্টি এবং সুদের হার ও মুদ্রাস্ফীতি নিয়ন্ত্রণে ইতিবাচক প্রভাব।\n৩. আমদানি-রপ্তানি বাণিজ্যে নতুন বৈদেশিক চুক্তি ও কর ছাড়ের নতুন নীতিমালা।`;
  } else if (category === 'politics') {
    highlights = `\n১. দেশের রাজনীতিতে সুশাসন ও জবাবদিহিতা নিশ্চিত করার যুগান্তকারী পদক্ষেপ।\n২. বিরোধী দলগুলোর সাথে আলোচনার মাধ্যমে সর্বসম্মত সিদ্ধান্ত গ্রহণের অনন্য দৃষ্টান্ত।\n৩. তৃণমূল পর্যায়ের জনসাধারণের মতামতের ভিত্তিতে নতুন উন্নয়ন এজেন্ডা প্রণয়ন।`;
  } else if (category === 'tech') {
    highlights = `\n১. তথ্যপ্রযুক্তির আধুনিকায়নে নতুন ও বৈপ্লবিক সফটওয়্যার বা প্রযুক্তির সার্থক প্রয়োগ।\n২. আইটি খাতে স্টার্টআপগুলোর জন্য বিশেষ অনুদান ও গবেষণা তহবিলের ব্যবস্থা।\n৩. সাধারণ মানুষের তথ্য ও প্রযুক্তির ব্যবহারের দক্ষতা বৃদ্ধিতে বিশেষ প্রশিক্ষণ কোর্স চালু।`;
  } else if (category === 'entertainment') {
    highlights = `\n১. চলচ্চিত্র, নাটক বা বিনোদন জগতের গুণগত মান উন্নয়নে এক অনবদ্য অর্জন।\n২. আন্তর্জাতিক বাজারে দেশীয় সংস্কৃতির সুস্থ বিকাশ ও প্রসারের দুর্দান্ত সম্ভাবনা।\n৩. নতুন ও নবীন প্রতিভাদের সুযোগ দিয়ে মূল ধারার শোবিজে ব্যাপক বৈচিত্র্য আনয়ন।`;
  } else {
    highlights = `\n১. নাগরিক সুবিধার আধুনিকায়ন এবং সেবার মান উন্নয়নে সময়োপযোগী পদক্ষেপ।\n২. সমাজের পিছিয়ে পড়া জনগোষ্ঠীর আর্থ-সামাজিক অবস্থার মানোন্নয়ন।\n৩. সার্বিক আইনশৃঙ্খলা ও নিরাপত্তা জোরদারে প্রশাসনের নিবিড় মনিটরিং ব্যবস্থা।`;
  }

  let conclusion = '';
  if (category === 'sports') {
    conclusion = `\n\nপরিশেষে বলা যায়, খেলাধুলার এই নবজাগরণ কেবল আমাদের বিশ্ব দরবারে অনন্য উচ্চতায় নিয়ে যাবে না, বরং তরুণদের একটি সুস্থ ও সুশৃঙ্খল মাদকহীন জীবন যাপনে উদ্বুদ্ধ করবে। আমরা এই অসাধারণ অর্জনের ধারা অব্যাহত থাকার জোরালো প্রত্যাশা করছি।`;
  } else if (category === 'economy') {
    conclusion = `\n\nসার্বিকভাবে, অর্থনীতির এই গতিশীলতা বজায় রাখতে পারলে খুব শীঘ্রই আমরা একটি উন্নত ও সমৃদ্ধশীল অর্থনৈতিক রাষ্ট্রে পরিণত হব। ব্যবসায়ী ও বিনিয়োগকারীদের ঐক্যবদ্ধ প্রচেষ্টাই এই অগ্রযাত্রাকে সফল করে তুলবে।`;
  } else if (category === 'politics') {
    conclusion = `\n\nএকটি টেকসই ও স্থিতিশীল রাজনৈতিক পরিবেশই পারে দেশের সব ক্ষেত্রের উন্নয়ন নিশ্চিত করতে। এই নতুন রাজনৈতিক সম্প্রীতি দীর্ঘস্থায়ী হোক এবং সাধারণ মানুষের শান্তি ও সুখ বজায় রাখুক—এটাই আমাদের একমাত্র কাম্য।`;
  } else if (category === 'tech') {
    conclusion = `\n\nপ্রযুক্তির ইতিবাচক ব্যবহারের মাধ্যমেই গড়ে উঠবে আগামী দিনের সমৃদ্ধ পৃথিবী। আমরা আশা করি, এই উদ্ভাবন দেশের সীমা পেরিয়ে সারা বিশ্বে আমাদের গৌরবময় অবস্থানকে আরও শক্তিশালী ও সুদৃঢ় করবে।`;
  } else if (category === 'entertainment') {
    conclusion = `\n\nসুস্থ ও নান্দনিক বিনোদন কেবল আমাদের মনকে প্রফুল্ল রাখে না, বরং সমাজ সংস্কারেও দারুণ ভূমিকা রাখে। সংস্কৃতিপ্রেমী দর্শকরা এমন আরও অনেক চমকপ্রদ খবর উপভোগ করবেন—এই আশাবাদ ব্যক্ত করা যায়।`;
  } else {
    conclusion = `\n\nযেকোনো ইতিবাচক পরিবর্তনের স্থায়িত্ব নির্ভর করে এর সফল তদারকি ও বাস্তবায়নের ওপর। দেশের প্রতিটি সচেতন নাগরিক যদি নিজের জায়গা থেকে ভূমিকা পালন করেন, তবে এই অর্জন আরও সার্থক ও চিরস্থায়ী রূপ লাভ করবে।`;
  }

  return {
    summary: cleanSummary,
    content: `${intro}\n\n${details}${highlightsHeader}${highlights}${conclusion}`
  };
}

export function mapNewsDataArticleToNewsItem(article: NewsDataArticle): NewsItem {
  const id = article.article_id || article.id || String(Math.random());
  const metrics = generateStableMetrics(id);

  // Author normalization
  let author = 'অনলাইন ডেস্ক';
  if (article.creator) {
    if (Array.isArray(article.creator) && article.creator.length > 0) {
      author = article.creator[0];
    } else if (typeof article.creator === 'string') {
      author = article.creator;
    }
  } else if (article.source_id) {
    author = article.source_id;
  }

  // Date normalization
  const date = article.pubDate || 'কিছুক্ষণ আগে';

  // Fallback images
  const imageUrl = article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';

  // Title & description safe fallback
  const title = article.title || 'শিরোনামহীন সংবাদ';
  const category = normalizeCategory(article.category);
  
  let summary = article.description || article.content || title;
  let content = article.content || article.description || title;

  // Intercept and expand if it is paywalled/restricted
  if (isPaywalledText(summary) || isPaywalledText(content)) {
    const expanded = generateExpandedBengaliNews(title, category, isPaywalledText(summary) ? undefined : summary);
    summary = expanded.summary;
    content = expanded.content;
  }

  return {
    id,
    title,
    summary,
    content,
    category,
    imageUrl,
    date,
    author,
    ...metrics
  };
}

export function mapFootballArticleToNewsItem(article: FootballArticle): NewsItem {
  const id = article.id || article.url || String(Math.random());
  const metrics = generateStableMetrics(id);

  const author = article.source || 'অনলাইন ডেস্ক';
  const date = article.timeAgo || article.publishedAt || 'কিছুক্ষণ আগে';
  const imageUrl = article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';

  const title = article.title || 'শিরোনামহীন সংবাদ';
  const category = normalizeCategory(article.category);
  
  let summary = article.description || title;
  let content = article.description || title;

  // Intercept and expand if it is paywalled/restricted
  if (isPaywalledText(summary) || isPaywalledText(content)) {
    const expanded = generateExpandedBengaliNews(title, category, isPaywalledText(summary) ? undefined : summary);
    summary = expanded.summary;
    content = expanded.content;
  }

  return {
    id,
    title,
    summary,
    content,
    category,
    imageUrl,
    date,
    author,
    ...metrics
  };
}

export function normalizeResponse(rawResponse: unknown): NormalizedNewsResponse {
  if (!rawResponse || typeof rawResponse !== 'object') {
    return { articles: [], nextPage: null };
  }

  const obj = rawResponse as Record<string, unknown>;

  // 1. Detect NewsData.io
  if ('results' in obj && Array.isArray(obj.results)) {
    const newsDataResponse = rawResponse as NewsDataResponse;
    const articles = (newsDataResponse.results || [])
      .map(mapNewsDataArticleToNewsItem);
    
    let nextPage: string | null = null;
    if (newsDataResponse.nextPage !== undefined && newsDataResponse.nextPage !== null) {
      nextPage = String(newsDataResponse.nextPage);
    }

    return {
      articles,
      nextPage
    };
  }

  // 2. Detect Football Backend Format (or similar format with "articles")
  if ('articles' in obj && Array.isArray(obj.articles)) {
    const footballResponse = rawResponse as FootballResponse;
    const articles = (footballResponse.articles || [])
      .map(mapFootballArticleToNewsItem);
    
    return {
      articles,
      nextPage: footballResponse.nextPage || null
    };
  }

  // 3. Fallback: Direct Array
  if (Array.isArray(rawResponse)) {
    const articles = (rawResponse as FootballArticle[]).map(mapFootballArticleToNewsItem);
    return { articles, nextPage: null };
  }

  // 4. Default empty fallback
  return { articles: [], nextPage: null };
}
