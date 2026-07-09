import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, Plus, Minus, Send, Heart, ArrowLeft, Clock, Calendar, Check, AlertTriangle, Eye, MessageSquare, BookOpen, Facebook, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsItem, Comment } from '../types';
import { convertToBanglaNumber } from '../utils/dateHelper';

interface NewsDetailPageProps {
  news: NewsItem;
  onBack: () => void;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onReactionUpdate: (newsId: string, reactionType: string) => void;
  userComments: Comment[];
  onAddComment: (newsId: string, author: string, content: string) => void;
  relatedNews: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
}

type ReadingTheme = 'light' | 'sepia' | 'dark';

export default function NewsDetailPage({
  news,
  onBack,
  isBookmarked,
  onBookmarkToggle,
  onReactionUpdate,
  userComments,
  onAddComment,
  relatedNews,
  onSelectNews
}: NewsDetailPageProps) {
  const [fontSize, setFontSize] = useState<number>(18); // Default clean reading size
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [hasReacted, setHasReacted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCommentContent('');
    setShowShareTooltip(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Load local reactions
    const savedReactions = localStorage.getItem(`user_reactions_${news.id}`);
    if (savedReactions) {
      setHasReacted(JSON.parse(savedReactions));
    } else {
      setHasReacted({});
    }
  }, [news]);

  const handleShareClick = () => {
    const url = `${window.location.origin}/news/${news.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2500);
    });
  };

  const handleLocalReaction = (reactionType: string) => {
    if (hasReacted[reactionType]) return;
    const updated = { ...hasReacted, [reactionType]: true };
    setHasReacted(updated);
    localStorage.setItem(`user_reactions_${news.id}`, JSON.stringify(updated));
    onReactionUpdate(news.id, reactionType);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    const authorName = commentAuthor.trim() || 'অনামী নাগরিক';
    onAddComment(news.id, authorName, commentContent.trim());
    setCommentContent('');
  };

  const articleComments = userComments.filter(c => c.newsId === news.id);

  const themeClasses = {
    light: 'bg-white text-slate-900 border-slate-200',
    sepia: 'bg-[#fcf7e8] text-[#433422] border-[#ebdcb9]',
    dark: 'bg-slate-950 text-slate-100 border-slate-800'
  };

  const textClasses = {
    light: 'text-slate-700',
    sepia: 'text-[#5a4833]',
    dark: 'text-slate-300'
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-brand-red hover:text-red-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>প্রচ্ছদে ফিরে যান</span>
        </button>

        {/* Reading Preference Tools */}
        <div className="flex items-center gap-3">
          {/* Resizer */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
              disabled={fontSize <= 14}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer text-slate-500"
              title="ফন্ট ছোট করুন"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold select-none text-slate-700 dark:text-slate-300">
              {convertToBanglaNumber(fontSize)}
            </span>
            <button
              onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
              disabled={fontSize >= 26}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer text-slate-500"
              title="ফন্ট বড় করুন"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reading Theme selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-[11px] font-semibold">
            {(['light', 'sepia', 'dark'] as ReadingTheme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => setReadingTheme(theme)}
                className={`px-3 py-1 rounded cursor-pointer transition ${
                  readingTheme === theme
                    ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {theme === 'light' ? 'আলো' : theme === 'sepia' ? 'উষ্ণ' : 'ডার্ক'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Dedicated News Article Reader (8/12) */}
        <article className={`lg:col-span-8 rounded-2xl p-6 md:p-8 border shadow-sm transition-all ${themeClasses[readingTheme]}`}>
          {/* Article Header Metadata */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-brand-red text-white uppercase">
                {news.category === 'national' ? 'জাতীয়' :
                 news.category === 'politics' ? 'রাজনীতি' :
                 news.category === 'economy' ? 'অর্থনীতি' :
                 news.category === 'sports' ? 'খেলা' :
                 news.category === 'entertainment' ? 'বিনোদন' :
                 news.category === 'tech' ? 'বিজ্ঞান ও প্রযুক্তি' : 'মতামত'}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" /> ৫ মিনিট পড়া
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug tracking-tight">
              {news.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200/60 py-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-brand-red font-bold font-sans">
                  {news.author.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">{news.author}</span>
                  <span className="text-[10px] text-slate-400">বাংলাদেশ খবর অনলাইন সংস্করণ</span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {news.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {convertToBanglaNumber(news.reads)} বার পঠিত
                </span>
              </div>
            </div>
          </div>

          {/* Core Article Featured Image */}
          <div className="my-6 rounded-xl overflow-hidden shadow-sm relative group bg-slate-100 max-h-[420px]">
            <img
              src={news.imageUrl}
              alt={news.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover max-h-[420px]"
            />
          </div>

          {/* Social Share & Action bar */}
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2 uppercase">শেয়ার করুন:</span>
              <button className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 cursor-pointer">
                <Facebook className="w-4 h-4 fill-current" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-500 cursor-pointer">
                <Twitter className="w-4 h-4 fill-current" />
              </button>
              <div className="relative">
                <button
                  onClick={handleShareClick}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-red cursor-pointer"
                  title="লিংক কপি করুন"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showShareTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: -30 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-0 bg-emerald-600 text-white font-bold text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap flex items-center gap-1 z-20"
                    >
                      <Check className="w-3 h-3" /> লিংক কপি হয়েছে!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bookmark button */}
            <button
              onClick={onBookmarkToggle}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                isBookmarked
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-transparent border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'বুকমার্কড' : 'বুকমার্ক করুন'}</span>
            </button>
          </div>

          {/* Core Content Body */}
          <div
            className={`leading-relaxed whitespace-pre-line font-medium ${textClasses[readingTheme]}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {news.content}
          </div>

          {/* Citizen Reporter Disclaimer */}
          {news.isUserSubmitted && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 flex gap-3 text-xs text-amber-800 dark:text-amber-200 mt-8">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">সতর্কতা ও ঘোষণা:</span> এই সংবাদটি একজন নাগরিক সাংবাদিক দ্বারা আমাদের ‘নাগরিক রিপোর্টার’ প্ল্যাটফর্মে প্রকাশ করা হয়েছে। এটি সম্পূর্ণ একটি মতামত ও ঘটনার নাগরিক উপস্থাপনা।
              </div>
            </div>
          )}

          {/* Reactions bar */}
          <div className="border-t border-slate-200/60 mt-8 pt-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">আপনার অনুভূতি জানান</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {[
                { type: 'like', emoji: '👍', label: 'লাইক' },
                { type: 'love', emoji: '❤️', label: 'লাভ' },
                { type: 'haha', emoji: '😂', label: 'হাাহা' },
                { type: 'wow', emoji: '😮', label: 'ওয়াও' },
                { type: 'sad', emoji: '😢', label: 'স্যাড' },
                { type: 'angry', emoji: '😡', label: 'অ্যাংগ্রি' }
              ].map((reaction) => {
                const count = news.reactions[reaction.type as keyof typeof news.reactions] || 0;
                const isVoted = hasReacted[reaction.type];

                return (
                  <button
                    key={reaction.type}
                    onClick={() => handleLocalReaction(reaction.type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer select-none ${
                      isVoted
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 text-brand-red'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-base">{reaction.emoji}</span>
                    <span>{reaction.label}</span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-full text-[10px]">
                      {convertToBanglaNumber(count)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Comments Engine */}
          <div className="border-t border-slate-200/60 mt-8 pt-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-blue dark:text-blue-400" />
              <span>মন্তব্যসমূহ ({convertToBanglaNumber(articleComments.length)})</span>
            </h3>

            {/* Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">মতামত দিন</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="আপনার নাম (ঐচ্ছিক)"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-2">
                <textarea
                  placeholder="এখানে আপনার গঠনমূলক মন্তব্য লিখুন..."
                  rows={2}
                  required
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none resize-none text-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="bg-brand-red hover:bg-red-700 text-white px-4 rounded-lg transition flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-900">
              {articleComments.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  কোনো মন্তব্য পাওয়া যায়নি। প্রথম ব্যক্তি হিসেবে আপনার মতামত শেয়ার করুন!
                </div>
              ) : (
                articleComments.map((comment) => (
                  <div key={comment.id} className="pt-3 first:pt-0">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{comment.author}</span>
                      <span className="text-[10px] text-slate-400">{comment.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-2.5 border-l-2 border-brand-red">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        {/* Right Column: Sidebar of Related/Trending Stories (4/12) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b-2 border-brand-red pb-2 mb-4 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-red" />
              <span>সম্পর্কিত আরও খবর</span>
            </h3>

            <div className="space-y-4">
              {relatedNews.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">কোনো সম্পর্কিত খবর পাওয়া যায়নি।</p>
              ) : (
                relatedNews.slice(0, 4).map((item) => (
                  <div
                    key={`related-${item.id}`}
                    onClick={() => onSelectNews(item)}
                    className="flex gap-3 group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 shrink-0">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-red transition line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">{item.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800">
            <h4 className="text-sm font-bold text-brand-red uppercase tracking-wider mb-2">অনলাইন সম্পাদকীয়</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              আপনার মতামত আমাদের অনুপ্রাণিত করে। এই খবর সম্পর্কে আপনার কোনো ভিন্ন বা গুরুত্বপূর্ণ তথ্য থাকলে মন্তব্য বাক্সে লিখুন। আমাদের লক্ষ্য স্বাধীন ও নাগরিক সাংবাদিকতা প্রসারিত করা।
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
