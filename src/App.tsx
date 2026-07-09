import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Flame, Sparkles, BookOpen, AlertCircle, ArrowRight, Search } from 'lucide-react';
import { motion } from 'motion/react';
import Header from './components/Header';
import NewsCard from './components/NewsCard';
import Widgets from './components/Widgets';
import NewsDetailPage from './components/NewsDetailPage';
import ReporterDesk from './components/ReporterDesk';
import BookmarksView from './components/BookmarksView';
import { NewsItem, Comment } from './types';
import { INITIAL_NEWS_DATA } from './data/newsData';
import { convertToBanglaNumber, getBanglaGregorianDate } from './utils/dateHelper';

import { useNews } from './hooks/useNews';

const NewsCardSkeleton = () => (
  <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-xs p-4 space-y-3 animate-pulse">
    <div className="bg-slate-200 h-44 w-full rounded-lg" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded w-1/4" />
      <div className="h-5 bg-slate-200 rounded w-11/12" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-4/5" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-200 rounded w-1/4" />
    </div>
  </div>
);

const HeroSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
    <div className="md:col-span-7 bg-slate-200 h-64 md:h-96 rounded-xl animate-pulse" />
    <div className="md:col-span-5 space-y-4 py-2">
      <div className="h-4 bg-slate-200 rounded w-1/4" />
      <div className="h-8 bg-slate-200 rounded w-11/12" />
      <div className="h-8 bg-slate-200 rounded w-3/4" />
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-1/3 pt-4" />
    </div>
  </div>
);

export default function App() {
  // --- Persistent Storage State Engine ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [localSubmittedNews, setLocalSubmittedNews] = useState<NewsItem[]>([]);
  const [newsOverrides, setNewsOverrides] = useState<Record<string, any>>({});
  
  // --- Application State ---
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [reporterDeskOpen, setReporterDeskOpen] = useState<boolean>(false);
  const [isViewingBookmarks, setIsViewingBookmarks] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ঢাকা');

  // Fetch from our new dynamic news hook
  const { news: apiNews, loading, error, refetch, isUsingFallback } = useNews({
    category: activeCategory,
    q: searchQuery
  });

  // Load and initialize data on mount
  useEffect(() => {
    // 1. Citizen reports / user submitted news
    const savedNews = localStorage.getItem('bangla_news_list');
    if (savedNews) {
      try {
        const parsed = JSON.parse(savedNews) as NewsItem[];
        // User submitted items have isUserSubmitted: true
        const userSubmitted = parsed.filter(item => item.isUserSubmitted);
        setLocalSubmittedNews(userSubmitted);
      } catch (e) {
        console.error('Error parsing local news:', e);
      }
    } else {
      // Seed initial dummy as citizen reports fallback or empty
      setLocalSubmittedNews([]);
    }

    // 2. Load news item overrides (for reactions, reads, comments count)
    const savedOverrides = localStorage.getItem('bangla_news_overrides');
    if (savedOverrides) {
      try {
        setNewsOverrides(JSON.parse(savedOverrides));
      } catch (e) {
        console.error('Error parsing overrides:', e);
      }
    }

    // 3. Comments
    const savedComments = localStorage.getItem('bangla_news_comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      // Seed initial comments
      const initialComments: Comment[] = [
        { id: 'c1', newsId: 'n1', author: 'কাজী সালাউদ্দিন', content: 'মেট্রোরেল কমলাপুর পর্যন্ত প্রসারিত হওয়া সত্যি ঢাকার জানজট নিয়ন্ত্রণে দারুন কার্যকরী পদক্ষেপ!', date: '০৯ জুলাই ২০২৬' },
        { id: 'c2', newsId: 'n1', author: 'মমতা বেগম', content: 'স্টেশনের চারপাশ পরিষ্কার রাখা দরকার, হকারদের যেন বসতে না দেওয়া হয়।', date: '০৯ জুলাই ২০২৬' },
        { id: 'c3', newsId: 'n2', author: 'রহমত উল্লাহ', content: 'সুন্দরবনে বাঘের সংখ্যা বৃদ্ধি সত্যি আনন্দের খবর। চোরাশিকার কঠোরভাবে বন্ধ রাখতে হবে।', date: '০৮ জুলাই ২০২৬' },
        { id: 'c4', newsId: 's1', author: 'সাকিব লাভার', content: 'কি ম্যাচ ছিল আজ! শ্বাসরুদ্ধকর শেষ ওভার, ইতিহাস গড়ে দিল ছেলেরা!', date: '০৯ জুলাই ২০২৬' }
      ];
      setComments(initialComments);
      localStorage.setItem('bangla_news_comments', JSON.stringify(initialComments));
    }

    // 4. Bookmarks
    const savedBookmarks = localStorage.getItem('bangla_news_bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Reset selectedNews when category, search query, or bookmarks view is toggled
  useEffect(() => {
    setSelectedNews(null);
  }, [activeCategory, searchQuery, isViewingBookmarks]);

  // Sync state helpers
  const updateNewsOverride = (newsId: string, fieldsToUpdate: any) => {
    setNewsOverrides(prev => {
      const current = prev[newsId] || {};
      const updatedItem = {
        ...current,
        ...fieldsToUpdate,
        reactions: fieldsToUpdate.reactions 
          ? { ...(current.reactions || {}), ...fieldsToUpdate.reactions }
          : current.reactions
      };
      const updatedOverrides = { ...prev, [newsId]: updatedItem };
      localStorage.setItem('bangla_news_overrides', JSON.stringify(updatedOverrides));
      return updatedOverrides;
    });
  };

  const syncCommentsToLocalStorage = (updatedComments: Comment[]) => {
    setComments(updatedComments);
    localStorage.setItem('bangla_news_comments', JSON.stringify(updatedComments));
  };

  // Build the unified local + API news list with interaction overrides
  const newsList = useMemo(() => {
    // Filter local user submitted articles by activeCategory and search query
    const filteredLocal = localSubmittedNews.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        return (
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Merge with API articles
    const merged = [...filteredLocal, ...apiNews];

    // Apply interaction overrides
    return merged.map((item) => {
      const override = newsOverrides[item.id];
      if (override) {
        return {
          ...item,
          reads: override.reads !== undefined ? override.reads : item.reads,
          commentsCount: override.commentsCount !== undefined ? override.commentsCount : item.commentsCount,
          reactions: override.reactions 
            ? { ...item.reactions, ...override.reactions } as any
            : item.reactions
        };
      }
      return item;
    });
  }, [apiNews, localSubmittedNews, activeCategory, searchQuery, newsOverrides]);

  // --- Actions ---

  // Handle article reactions
  const handleReactionUpdate = (newsId: string, reactionType: string) => {
    const targetItem = newsList.find((n) => n.id === newsId);
    if (!targetItem) return;

    const currentReactions = { ...targetItem.reactions };
    const key = reactionType as keyof typeof currentReactions;
    const newVal = (currentReactions[key] || 0) + 1;

    updateNewsOverride(newsId, {
      reactions: { [key]: newVal }
    });

    if (selectedNews && selectedNews.id === newsId) {
      setSelectedNews({
        ...selectedNews,
        reactions: {
          ...selectedNews.reactions,
          [key]: newVal
        }
      });
    }
  };

  // Handle comment submissions
  const handleAddComment = (newsId: string, author: string, contentText: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      newsId,
      author,
      content: contentText,
      date: getBanglaGregorianDate(new Date())
    };

    const updatedComments = [newComment, ...comments];
    syncCommentsToLocalStorage(updatedComments);

    // Increment commentsCount in news overrides
    const targetItem = newsList.find((n) => n.id === newsId);
    const currentCommentsCount = targetItem ? targetItem.commentsCount : 0;
    const nextCommentsCount = currentCommentsCount + 1;

    updateNewsOverride(newsId, {
      commentsCount: nextCommentsCount
    });

    if (selectedNews && selectedNews.id === newsId) {
      setSelectedNews({
        ...selectedNews,
        commentsCount: nextCommentsCount
      });
    }
  };

  // Handle publishing a new citizen report
  const handlePublishNews = (newArticle: NewsItem) => {
    const updatedLocal = [newArticle, ...localSubmittedNews];
    setLocalSubmittedNews(updatedLocal);

    // Save to localStorage so they persist across reloads
    const savedNews = localStorage.getItem('bangla_news_list') || '[]';
    try {
      const parsed = JSON.parse(savedNews) as NewsItem[];
      localStorage.setItem('bangla_news_list', JSON.stringify([newArticle, ...parsed]));
    } catch {
      localStorage.setItem('bangla_news_list', JSON.stringify([newArticle]));
    }
  };

  // Handle toggling bookmarks
  const handleBookmarkToggle = (newsId: string) => {
    let updatedBookmarks: string[];
    if (bookmarks.includes(newsId)) {
      updatedBookmarks = bookmarks.filter((id) => id !== newsId);
    } else {
      updatedBookmarks = [...bookmarks, newsId];
    }
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bangla_news_bookmarks', JSON.stringify(updatedBookmarks));
  };

  const handleClearAllBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem('bangla_news_bookmarks');
  };

  // --- Filtering & Selection ---

  // Latest breaking news titles
  const breakingNews = useMemo(() => {
    return newsList.slice(0, 5);
  }, [newsList]);

  // List of bookmarked news objects
  const bookmarkedNewsItems = useMemo(() => {
    return newsList.filter((news) => bookmarks.includes(news.id));
  }, [newsList, bookmarks]);

  // Sorting and filtering news
  const filteredNews = useMemo(() => {
    let result = [...newsList];

    // Filter by active category
    if (activeCategory !== 'all') {
      result = result.filter((news) => news.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (news) =>
          news.title.toLowerCase().includes(query) ||
          news.summary.toLowerCase().includes(query) ||
          news.content.toLowerCase().includes(query) ||
          news.author.toLowerCase().includes(query)
      );
    }

    return result;
  }, [newsList, activeCategory, searchQuery]);

  // Trending / Most read ranking
  const trendingNews = useMemo(() => {
    return [...newsList]
      .sort((a, b) => b.reads - a.reads)
      .slice(0, 5);
  }, [newsList]);

  // Opinion column articles list
  const opinionArticles = useMemo(() => {
    return newsList.filter((news) => news.category === 'opinion');
  }, [newsList]);

  // Safe category names mapping for title headers
  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'national': return 'জাতীয় খবর';
      case 'politics': return 'রাজনৈতিক আপডেট';
      case 'economy': return 'অর্থ ও বাণিজ্য';
      case 'sports': return 'ক্রীড়াঙ্গনের খবর';
      case 'entertainment': return 'বিনোদন ও শোবিজ';
      case 'tech': return 'বিজ্ঞান ও তথ্যপ্রযুক্তি';
      case 'opinion': return 'মতামত ও কলাম';
      default: return 'আজকের সবশেষ আপডেট';
    }
  };

  // Safe reading stats click handler
  const handleOpenNewsModal = (news: NewsItem) => {
    // Increment read counter upon click
    const nextReads = news.reads + 1;
    updateNewsOverride(news.id, {
      reads: nextReads
    });
    
    // Set active modal
    setSelectedNews({ ...news, reads: nextReads });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 selection:bg-red-200 selection:text-brand-red">
      {/* Newspaper Header */}
      <Header
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        breakingNews={breakingNews}
        onSelectNews={handleOpenNewsModal}
        onOpenReporterDesk={() => setReporterDeskOpen(true)}
        isViewingBookmarks={isViewingBookmarks}
        setIsViewingBookmarks={setIsViewingBookmarks}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        onLogoClick={() => setSelectedNews(null)}
      />

      {/* Main Content Pane */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {selectedNews ? (
          // Standalone Full-Page News Reader View
          <NewsDetailPage
            news={selectedNews}
            onBack={() => setSelectedNews(null)}
            isBookmarked={bookmarks.includes(selectedNews.id)}
            onBookmarkToggle={() => handleBookmarkToggle(selectedNews.id)}
            onReactionUpdate={handleReactionUpdate}
            userComments={comments}
            onAddComment={handleAddComment}
            relatedNews={newsList.filter(item => item.id !== selectedNews.id)}
            onSelectNews={handleOpenNewsModal}
          />
        ) : isViewingBookmarks ? (
          // Bookmarks View
          <BookmarksView
            bookmarkedNews={bookmarkedNewsItems}
            onSelectNews={handleOpenNewsModal}
            onBookmarkToggle={handleBookmarkToggle}
            onClearAll={handleClearAllBookmarks}
            onBackToHome={() => setIsViewingBookmarks(false)}
          />
        ) : (
          // Main Portal View
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left / Central Column: News feed (8/12 of screen width on large desktops) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Category Page Header or Search Results info */}
              {searchQuery.trim() !== '' ? (
                <div className="border-b border-gray-200 pb-3">
                  <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                    <Search className="w-5 h-5 text-brand-blue" />
                    <span>‘{searchQuery}’ অনুসন্ধানের ফলাফল ({convertToBanglaNumber(filteredNews.length)}টি সংবাদ পাওয়া গেছে)</span>
                  </h2>
                </div>
              ) : activeCategory !== 'all' ? (
                <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 border-l-4 border-brand-red pl-3">
                    {getCategoryTitle(activeCategory)}
                  </h2>
                  <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-full">
                    মোট {convertToBanglaNumber(filteredNews.length)}টি খবর
                  </span>
                </div>
              ) : null}

              {isUsingFallback && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-3 text-amber-800 text-xs flex items-start gap-2.5 shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">আর্কাইভ মোড: </span>
                    লাইভ নিউজ এপিআই সার্ভার থেকে সরাসরি সংবাদ লোড করা সম্ভব হয়নি (API Credentials প্রয়োজন)। আপনাকে আমাদের সমৃদ্ধ অফলাইন ব্যাকআপ ডাটাবেস থেকে খবরগুলো প্রদর্শন করা হচ্ছে। আপনি এই খবরগুলোতে প্রতিক্রিয়া, মন্তব্য ও বুকমার্ক করতে পারবেন।
                  </div>
                </motion.div>
              )}

              {/* Grid Content rendering */}
              {loading ? (
                <div className="space-y-8">
                  {activeCategory === 'all' && searchQuery.trim() === '' && (
                    <div className="newspaper-double-border py-4">
                      <div className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> খবর লোড হচ্ছে...
                      </div>
                      <HeroSkeleton />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <NewsCardSkeleton />
                      <NewsCardSkeleton />
                      <NewsCardSkeleton />
                      <NewsCardSkeleton />
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-brand-red" />
                  <h3 className="text-lg font-bold text-slate-800">দুঃখিত, খবর লোড করা সম্ভব হয়নি</h3>
                  <p className="text-sm text-slate-600 max-w-md leading-relaxed">{error}</p>
                  <button
                    onClick={refetch}
                    className="px-5 py-2 bg-brand-red text-white font-bold text-xs rounded-lg hover:bg-red-700 transition cursor-pointer shadow-xs"
                  >
                    পুনরায় চেষ্টা করুন
                  </button>
                </div>
              ) : filteredNews.length === 0 ? (
                // Empty state
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-gray-300" />
                  <h3 className="text-base font-bold text-gray-700">দুঃখিত, কোনো খবর পাওয়া যায়নি</h3>
                  <p className="text-xs text-gray-400">অনুগ্রহ করে ভিন্ন কোনো শব্দ লিখে পুনরায় অনুসন্ধান করুন অথবা অন্য বিভাগে খবর খুঁজুন।</p>
                </div>
              ) : activeCategory === 'all' && searchQuery.trim() === '' ? (
                // Classic Newspaper Layout: One Hero Main Spot + Rest in Grid
                <div className="space-y-8">
                  {/* Frontpage Hero slot */}
                  <div className="newspaper-double-border py-4">
                    <div className="text-[11px] font-bold text-brand-red uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> আজকের প্রধান সংবাদ
                    </div>
                    <NewsCard
                      news={filteredNews[0]}
                      onClick={() => handleOpenNewsModal(filteredNews[0])}
                      layout="hero"
                      isBookmarked={bookmarks.includes(filteredNews[0].id)}
                      onBookmarkToggle={() => handleBookmarkToggle(filteredNews[0].id)}
                    />
                  </div>

                  {/* Rest of the articles */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-extrabold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-1.5">
                      <Newspaper className="w-4 h-4 text-brand-blue" />
                      <span>সর্বশেষ আপডেট খবর</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredNews.slice(1).map((news) => (
                        <NewsCard
                          key={news.id}
                          news={news}
                          onClick={() => handleOpenNewsModal(news)}
                          layout="grid"
                          isBookmarked={bookmarks.includes(news.id)}
                          onBookmarkToggle={() => handleBookmarkToggle(news.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Standard category/search listing grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNews.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={news}
                      onClick={() => handleOpenNewsModal(news)}
                      layout="grid"
                      isBookmarked={bookmarks.includes(news.id)}
                      onBookmarkToggle={() => handleBookmarkToggle(news.id)}
                    />
                  ))}
                </div>
              )}

              {/* Editorial / Columns Spot inside Home View */}
              {activeCategory === 'all' && searchQuery.trim() === '' && opinionArticles.length > 0 && (
                <div className="pt-6 border-t border-gray-200/60 space-y-4">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 fill-current" />
                    <span>বিশেষ কলাম ও মতামত</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {opinionArticles.map((article) => (
                      <NewsCard
                        key={`opinion-${article.id}`}
                        news={article}
                        onClick={() => handleOpenNewsModal(article)}
                        layout="editorial"
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Sidebar: Side Widgets & Rankings (4/12 of screen width on large desktops) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Daily Quote / Editorial Feature (if present and not viewing category/search) */}
              <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4 text-xs text-brand-blue">
                <div className="flex items-center gap-1.5 font-bold mb-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>সম্পাদকের সম্পাদকীয়</span>
                </div>
                <p className="leading-relaxed font-medium">
                  ‘বাংলাদেশ খবর’ স্বাধীন ও নিরপেক্ষ সাংবাদিকতার অঙ্গীকার নিয়ে পরিচালিত। দেশের উন্নয়নে সত্যের বাণী সবার কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য। আমাদের কোনো প্রকাশিত খবরে আপনার গঠনমূলক প্রতিক্রিয়া বা নাগরিক রিপোর্ট থাকলে রিপোর্টার ডেস্কে লিখুন।
                </p>
              </div>

              {/* Sidebar Widgets (Cricket, Trending list, Poll, Financial rates) */}
              <Widgets
                trendingNews={trendingNews}
                onSelectNews={handleOpenNewsModal}
              />

            </aside>

          </div>
        )}
      </main>

      {/* --- Overlay Modals (Lazy Loaded/Triggered dynamically) --- */}

      {/* Citizen News Editor Desk Modal */}
      <ReporterDesk
        isOpen={reporterDeskOpen}
        onClose={() => setReporterDeskOpen(false)}
        onPublish={handlePublishNews}
      />
    </div>
  );
}
