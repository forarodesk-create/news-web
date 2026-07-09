import React, { useState } from 'react';
import { X, Sparkles, PenSquare, Upload, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsItem } from '../types';
import { getBanglaGregorianDate } from '../utils/dateHelper';

interface ReporterDeskProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (news: NewsItem) => void;
}

const PRESET_IMAGES = [
  { label: 'জাতীয় / উন্নয়ন', url: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=800&q=80' },
  { label: 'খেলাধুলা / ক্রিকেট', url: 'https://images.unsplash.com/photo-1531415080290-bc9854503f37?auto=format&fit=crop&w=800&q=80' },
  { label: 'তথ্যপ্রযুক্তি', url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80' },
  { label: 'প্রকৃতি / পরিবেশ', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80' },
  { label: 'চলচ্চিত্র / বিনোদন', url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80' }
];

export default function ReporterDesk({ isOpen, onClose, onPublish }: ReporterDeskProps) {
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('national');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [showPresetGallery, setShowPresetGallery] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) return;

    const newArticle: NewsItem = {
      id: `user-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      category: category,
      imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
      date: getBanglaGregorianDate(new Date()),
      author: author.trim() || 'নাগরিক সাংবাদিক',
      reads: 1, // initial read
      reactions: { like: 1, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      commentsCount: 0,
      isUserSubmitted: true
    };

    onPublish(newArticle);
    setSuccess(true);
    
    // reset form fields
    setTimeout(() => {
      setSuccess(false);
      onClose();
      setAuthor('');
      setTitle('');
      setCategory('national');
      setSummary('');
      setContent('');
      setImageUrl(PRESET_IMAGES[0].url);
    }, 2000);
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

        {/* Modal content container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl overflow-hidden shadow-2xl z-10 w-full max-w-2xl flex flex-col max-h-[90vh] border border-gray-100"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-brand-blue text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PenSquare className="w-5 h-5 text-yellow-300 animate-pulse" />
                <div>
                  <h2 className="text-lg font-bold">নাগরিক রিপোর্টার ডেস্ক</h2>
                  <p className="text-[10px] text-blue-200">এখানে নিজের খবর নিজেই প্রকাশ করুন ও সবার কাছে পৌঁছে দিন</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scroll Pane */}
            <div className="flex-1 overflow-y-auto p-6">
              {success ? (
                // Success State Animation
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">প্রকাশনা সফল হয়েছে!</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    অভিনন্দন! আপনার সংবাদটি সফলভাবে ‘বাংলাদেশ খবর’ পোর্টালে প্রকাশিত হয়েছে। এখন এটি প্রধান পাতায় দেখা যাবে।
                  </p>
                </motion.div>
              ) : (
                // Form Fields
                <form id="reporter-form" onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Warning / Guidelines */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">নাগরিক সাংবাদিকতার শর্তাবলী:</span> কোনো অসত্য বা বিভ্রান্তিকর সংবাদ শেয়ার করবেন না। আপনার লেখার দায়িত্ব আপনার নিজের। গঠনমূলক ও সত্য সংবাদ প্রকাশ করে সমাজকে সচেতন করুন।
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Reporter Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                        প্রতিবেদকের নাম / লেখক
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: আবদুর রহমান"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition"
                      />
                    </div>

                    {/* Category Select */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                        সংবাদের বিভাগ নির্বাচন করুন *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue bg-white outline-none transition"
                      >
                        <option value="national">জাতীয়</option>
                        <option value="politics">রাজনীতি</option>
                        <option value="economy">অর্থনীতি</option>
                        <option value="sports">খেলা</option>
                        <option value="entertainment">বিনোদন</option>
                        <option value="tech">বিজ্ঞান ও প্রযুক্তি</option>
                        <option value="opinion">মতামত</option>
                      </select>
                    </div>
                  </div>

                  {/* Headline Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      সংবাদের আকর্ষণীয় শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: আমাদের এলাকায় যুবসমাজের উদ্যোগে গড়ে উঠেছে নতুন লাইব্রেরি"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue font-bold outline-none transition"
                    />
                  </div>

                  {/* Short Summary */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      সংক্ষিপ্ত বিবরণ / ভূমিকা (এক-দুই লাইন) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="পাঠকদের আকৃষ্ট করার মতো সংবাদের মূল চুম্বক অংশ"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition"
                    />
                  </div>

                  {/* Image input and Gallery presets */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex justify-between items-center">
                      <span>সংবাদের ছবি (ইমেজ লিংক অথবা আমাদের প্রিসেট গ্যালারি থেকে)</span>
                      <button
                        type="button"
                        onClick={() => setShowPresetGallery(!showPresetGallery)}
                        className="text-xs text-brand-blue hover:text-brand-red font-semibold underline flex items-center gap-0.5 cursor-pointer"
                      >
                        {showPresetGallery ? 'গ্যালারি বন্ধ করুন' : 'গ্যালারি থেকে নিন'}
                      </button>
                    </label>
                    
                    {!showPresetGallery ? (
                      <input
                        type="url"
                        placeholder="যেমন: https://unsplash.com/photos/... বা ছবির ডিরেক্ট লিংক"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition"
                      />
                    ) : (
                      <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3">
                        <p className="text-[10px] text-gray-500 font-medium">নিচের ছবিগুলোতে ক্লিক করে সংবাদের জন্য ব্যবহার করতে পারেন:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {PRESET_IMAGES.map((img) => (
                            <button
                              key={img.label}
                              type="button"
                              onClick={() => {
                                setImageUrl(img.url);
                                setShowPresetGallery(false);
                              }}
                              className={`relative h-14 rounded overflow-hidden border-2 transition cursor-pointer ${
                                imageUrl === img.url ? 'border-brand-blue shadow-md scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img src={img.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                                <span className="text-[8px] font-black text-white">{img.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Full News Content */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      বিস্তারিত খবর (মূল বিবরণ) *
                    </label>
                    <textarea
                      required
                      placeholder="এখানে খবরের মূল বিবরণ বা ঘটনাটি সুন্দরভাবে বিস্তারিত লিখুন..."
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-800 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300 fill-current" />
                      <span>সংবাদ প্রকাশ করুন</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
