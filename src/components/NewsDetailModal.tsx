import React, { useState, useEffect } from 'react';
import { X, Bookmark, Share2, Plus, Minus, Send, ThumbsUp, Heart, Smile, AlertTriangle, MessageSquare, BookOpen, Clock, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsItem, Comment } from '../types';
import { convertToBanglaNumber } from '../utils/dateHelper';

interface NewsDetailModalProps {
  news: NewsItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onReactionUpdate: (newsId: string, reactionType: string) => void;
  userComments: Comment[];
  onAddComment: (newsId: string, author: string, content: string) => void;
}

type ReadingTheme = 'light' | 'sepia' | 'dark';

export default function NewsDetailModal({
  news,
  onClose,
  isBookmarked,
  onBookmarkToggle,
  onReactionUpdate,
  userComments,
  onAddComment
}: NewsDetailModalProps) {
  const [fontSize, setFontSize] = useState<number>(16); // default 16px (text-base)
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [hasReacted, setHasReacted] = useState<Record<string, boolean>>({});

  // Reset state when news item changes
  useEffect(() => {
    if (news) {
      setCommentContent('');
      setShowShareTooltip(false);
      // Load user reactions for this news from local storage
      const savedReactions = localStorage.getItem(`user_reactions_${news.id}`);
      if (savedReactions) {
        setHasReacted(JSON.parse(savedReactions));
      } else {
        setHasReacted({});
      }
    }
  }, [news]);

  if (!news) return null;

  const handleShareClick = () => {
    const url = `${window.location.origin}/news/${news.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2500);
    }).catch(() => {
      // fallback
      alert('লিংকটি কপি করা হয়েছে: ' + url);
    });
  };

  const handleLocalReaction = (reactionType: string) => {
    // Limit to 1 click per reaction type for a news item to keep it realistic
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
    
    // Clear comment content field
    setCommentContent('');
  };

  // Filter comments for this article
  const articleComments = userComments.filter(c => c.newsId === news.id);

  // Background style based on reading light selection
  const themeClasses = {
    light: 'bg-white text-gray-800',
    sepia: 'bg-[#fcf7e8] text-[#433422]',
    dark: 'bg-zinc-900 text-gray-100'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] ${themeClasses[readingTheme]}`}
          >
            {/* Modal Sticky Header (Close, size & theme controls) */}
            <div className="sticky top-0 z-10 px-6 py-3 border-b border-gray-200/50 bg-inherit flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-red text-white uppercase">
                  {news.category === 'national' ? 'জাতীয়' :
                   news.category === 'politics' ? 'রাজনীতি' :
                   news.category === 'economy' ? 'অর্থনীতি' :
                   news.category === 'sports' ? 'খেলা' :
                   news.category === 'entertainment' ? 'বিনোদন' :
                   news.category === 'tech' ? 'বিজ্ঞান ও প্রযুক্তি' : 'মতামত'}
                </span>
                <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" /> ৫ মিনিট পড়া
                </span>
              </div>

              {/* Reading Controls */}
              <div className="flex items-center gap-3">
                {/* Font Size Tuner */}
                <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-md p-0.5 text-xs">
                  <button
                    onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                    disabled={fontSize <= 12}
                    className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-50 transition cursor-pointer text-gray-500 dark:text-gray-400"
                    title="ফন্ট ছোট করুন"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-bold text-gray-700 dark:text-gray-300 select-none">
                    {convertToBanglaNumber(fontSize)}
                  </span>
                  <button
                    onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                    disabled={fontSize >= 24}
                    className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-50 transition cursor-pointer text-gray-500 dark:text-gray-400"
                    title="ফন্ট বড় করুন"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Theme toggler */}
                <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-md p-0.5 text-[10px] font-bold">
                  {(['light', 'sepia', 'dark'] as ReadingTheme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setReadingTheme(t)}
                      className={`px-2 py-0.5 rounded cursor-pointer capitalize transition ${
                        readingTheme === t
                          ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
                      }`}
                    >
                      {t === 'light' ? 'আলো' : t === 'sepia' ? 'উষ্ণ' : 'অন্ধকার'}
                    </button>
                  ))}
                </div>

                <span className="text-gray-300">|</span>

                {/* Bookmark & Share */}
                <button
                  onClick={onBookmarkToggle}
                  className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer ${
                    isBookmarked ? 'text-brand-blue dark:text-blue-400' : 'text-gray-400'
                  }`}
                  title={isBookmarked ? "বুকমার্ক থেকে সরান" : "বুকমার্ক করুন"}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                <div className="relative">
                  <button
                    onClick={handleShareClick}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer text-gray-400 hover:text-brand-red"
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
                        className="absolute right-0 bg-emerald-600 text-white font-semibold text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap flex items-center gap-1 z-20"
                      >
                        <Check className="w-3 h-3" /> লিংক কপি হয়েছে!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <span className="text-gray-300">|</span>

                {/* Close Button */}
                <button
                  id="close-modal-btn"
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-brand-red transition cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Scroll Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Image Banner */}
              <div className="h-56 sm:h-72 w-full rounded-xl overflow-hidden relative shadow-sm">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Metadata */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                  {news.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200/50 pb-4">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{news.author}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {news.date}
                  </span>
                  <span>•</span>
                  <span>{convertToBanglaNumber(news.reads)} বার পঠিত</span>
                </div>
              </div>

              {/* Article Content */}
              <article
                className="leading-relaxed whitespace-pre-line font-medium"
                style={{ fontSize: `${fontSize}px` }}
              >
                {news.content}
              </article>

              {/* Citizen Warning for submitted articles */}
              {news.isUserSubmitted && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex gap-3 text-xs text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">সতর্কতা ও ঘোষণা:</span> এই সংবাদটি একজন নাগরিক সাংবাদিক দ্বারা আমাদের ‘নাগরিক রিপোর্টার’ প্ল্যাটফর্মে প্রকাশ করা হয়েছে। এটি সম্পূর্ণ একটি মতামত ও ঘটনার নাগরিক উপস্থাপনা।
                  </div>
                </div>
              )}

              {/* Reactions Panel */}
              <div className="border-y border-gray-200/50 py-4 space-y-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                  আপনার অনুভূতি জানান
                </h3>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {[
                    { type: 'like', emoji: '👍', label: 'লাইক' },
                    { type: 'love', emoji: '❤️', label: 'ভালোবাসা' },
                    { type: 'haha', emoji: '😂', label: 'হাাহা' },
                    { type: 'wow', emoji: '😮', label: 'ওয়াও' },
                    { type: 'sad', emoji: '😢', label: 'দুঃখিত' },
                    { type: 'angry', emoji: '😡', label: 'রাগ' }
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
                            : 'bg-transparent border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-base">{reaction.emoji}</span>
                        <span>{reaction.label}</span>
                        <span className="bg-gray-200/70 dark:bg-zinc-800 px-1.5 py-0.2 rounded-full text-[10px]">
                          {convertToBanglaNumber(count)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Comments Engine */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-blue dark:text-blue-400" />
                  <span>মন্তব্যসমূহ ({convertToBanglaNumber(articleComments.length)})</span>
                </h3>

                {/* Comment Box Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-3 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200/50">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">আপনার মন্তব্য লিখুন</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="আপনার নাম (ঐচ্ছিক)"
                      value={commentAuthor}
                      onChange={(e) => setCommentAuthor(e.target.value)}
                      className="px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      placeholder="এখানে আপনার গঠনমূলক মন্তব্য লিখুন..."
                      rows={2}
                      required
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none resize-none"
                    />
                    <button
                      type="submit"
                      className="bg-brand-blue hover:bg-blue-800 text-white px-4 rounded-md transition flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3 divide-y divide-gray-100 dark:divide-zinc-800">
                  {articleComments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400">
                      কোনো মন্তব্য পাওয়া যায়নি। প্রথম ব্যক্তি হিসেবে আপনার মতামত শেয়ার করুন!
                    </div>
                  ) : (
                    articleComments.map((comment) => (
                      <div key={comment.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center mb-1 text-xs">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{comment.author}</span>
                          <span className="text-[10px] text-gray-400">{comment.date}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pl-2 border-l-2 border-gray-200 dark:border-zinc-700">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
