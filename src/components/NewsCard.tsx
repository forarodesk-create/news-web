import React from 'react';
import { Eye, MessageSquare, Bookmark, Heart, Sparkles, User } from 'lucide-react';
import { motion } from 'motion/react';
import { NewsItem } from '../types';

interface NewsCardProps {
  key?: React.Key;
  news: NewsItem;
  onClick: () => void;
  layout: 'hero' | 'grid' | 'list' | 'editorial';
  isBookmarked?: boolean;
  onBookmarkToggle?: (e: React.MouseEvent) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; colorClass: string }> = {
  national: { label: 'জাতীয়', colorClass: 'bg-brand-red text-white' },
  politics: { label: 'রাজনীতি', colorClass: 'bg-brand-blue text-white' },
  economy: { label: 'অর্থনীতি', colorClass: 'bg-amber-600 text-white' },
  sports: { label: 'খেলা', colorClass: 'bg-emerald-600 text-white' },
  entertainment: { label: 'বিনোদন', colorClass: 'bg-pink-600 text-white' },
  tech: { label: 'বিজ্ঞান ও প্রযুক্তি', colorClass: 'bg-purple-600 text-white' },
  opinion: { label: 'মতামত', colorClass: 'bg-stone-700 text-white' }
};

export default function NewsCard({
  news,
  onClick,
  layout,
  isBookmarked = false,
  onBookmarkToggle
}: NewsCardProps) {
  const catInfo = CATEGORY_LABELS[news.category] || { label: 'খবর', colorClass: 'bg-gray-100 text-gray-800' };
  
  // Total reactions count
  const totalReactions = Object.values(news.reactions).reduce((a, b) => a + b, 0);

  if (layout === 'hero') {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer flex flex-col lg:flex-row h-full transition"
        onClick={onClick}
      >
        <div className="lg:w-3/5 h-64 sm:h-80 lg:h-auto relative overflow-hidden">
          <img
            src={news.imageUrl}
            alt={news.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-bold shadow-sm ${catInfo.colorClass}`}>
              {catInfo.label}
            </span>
            {news.isUserSubmitted && (
              <span className="bg-brand-red text-white px-2.5 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 fill-current" /> নাগরিক রিপোর্টার
              </span>
            )}
          </div>
        </div>

        <div className="lg:w-2/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span>{news.date}</span>
              <span>{news.author}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug hover:text-brand-red transition mb-3">
              {news.title}
            </h2>
            <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed mb-4">
              {news.summary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{news.reads} বার পড়া হয়েছে</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>{totalReactions}</span>
              </span>
              {news.commentsCount > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{news.commentsCount} মন্তব্য</span>
                </span>
              )}
            </div>

            {onBookmarkToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle(e);
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 transition cursor-pointer text-gray-400 hover:text-brand-blue"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-brand-blue fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (layout === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer flex flex-col h-full transition"
        onClick={onClick}
      >
        <div className="h-44 relative overflow-hidden bg-gray-100">
          <img
            src={news.imageUrl}
            alt={news.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`px-2 py-0.5 rounded text-xs font-bold shadow-xs ${catInfo.colorClass}`}>
              {catInfo.label}
            </span>
            {news.isUserSubmitted && (
              <span className="bg-brand-red text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-xs flex items-center gap-1">
                রিপোর্টার
              </span>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-center text-[11px] text-gray-500 mb-2">
            <span>{news.date}</span>
            <span className="truncate max-w-[120px]">{news.author}</span>
          </div>
          
          <h3 className="text-base font-bold text-gray-900 leading-snug hover:text-brand-red transition line-clamp-2 mb-2">
            {news.title}
          </h3>
          
          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
            {news.summary}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto text-[11px] text-gray-500">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-0.5">
                <Eye className="w-3.5 h-3.5" />
                <span>{news.reads}</span>
              </span>
              <span className="flex items-center gap-0.5">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                <span>{totalReactions}</span>
              </span>
              {news.commentsCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{news.commentsCount}</span>
                </span>
              )}
            </div>

            {onBookmarkToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle(e);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer text-gray-400 hover:text-brand-blue"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-brand-blue fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (layout === 'list') {
    return (
      <div
        className="py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 px-2 rounded-lg transition cursor-pointer flex gap-3 items-start"
        onClick={onClick}
      >
        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 shrink-0 mt-0.5">
          <img
            src={news.imageUrl}
            alt={news.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${catInfo.colorClass}`}>
              {catInfo.label}
            </span>
            <span className="text-[10px] text-gray-400">{news.date}</span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-gray-800 hover:text-brand-red leading-snug line-clamp-2">
            {news.title}
          </h4>
        </div>
      </div>
    );
  }

  // Editorial layout
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-5 shadow-xs cursor-pointer hover:shadow-sm transition"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-800 font-bold border border-orange-200">
          <User className="w-5 h-5 text-orange-700" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">{news.author}</h4>
          <p className="text-[10px] text-orange-700 font-semibold uppercase tracking-wider">কলাম লেখক</p>
        </div>
      </div>
      <blockquote className="text-sm font-medium italic text-gray-700 border-l-2 border-orange-300 pl-3 mb-3 leading-relaxed">
        “{news.summary}”
      </blockquote>
      <h3 className="text-base font-bold text-gray-900 hover:text-brand-red transition line-clamp-2">
        {news.title}
      </h3>
      <div className="flex justify-between items-center text-[10px] text-gray-400 mt-4 pt-3 border-t border-yellow-100">
        <span>মতামত কলাম</span>
        <span>{news.date}</span>
      </div>
    </motion.div>
  );
}
