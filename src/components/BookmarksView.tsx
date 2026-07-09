import React from 'react';
import { Bookmark, Trash2, ArrowLeft, Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { NewsItem } from '../types';
import NewsCard from './NewsCard';

interface BookmarksViewProps {
  bookmarkedNews: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
  onBookmarkToggle: (newsId: string) => void;
  onClearAll: () => void;
  onBackToHome: () => void;
}

export default function BookmarksView({
  bookmarkedNews,
  onSelectNews,
  onBookmarkToggle,
  onClearAll,
  onBackToHome
}: BookmarksViewProps) {
  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-200 pb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-red transition mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>প্রচ্ছদে ফিরে যান</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-blue fill-current animate-pulse" />
            <span>আমার বুকমার্ক করা সংবাদসমূহ</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">আপনার অফলাইনে বা পরে পড়ার জন্য সংরক্ষিত সংবাদের তালিকা</p>
        </div>

        {bookmarkedNews.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>সব বুকমার্ক মুছুন</span>
          </button>
        )}
      </div>

      {/* Bookmarked News Grid */}
      {bookmarkedNews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-lg mx-auto flex flex-col items-center space-y-4 shadow-xs"
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">কোনো বুকমার্ক খুঁজে পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            আপনার কোনো খবর পছন্দ হলে পরে সহজে পড়ার জন্য খবরের পাশে থাকা বুকমার্ক চিহ্নে ক্লিক করুন। বুকমার্ক করা খবরগুলো এখানে জমা হবে।
          </p>
          <button
            onClick={onBackToHome}
            className="bg-brand-blue hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition cursor-pointer"
          >
            খবর পড়তে যান
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {bookmarkedNews.map((news) => (
            <NewsCard
              key={`bookmark-card-${news.id}`}
              news={news}
              onClick={() => onSelectNews(news)}
              layout="grid"
              isBookmarked={true}
              onBookmarkToggle={() => onBookmarkToggle(news.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
