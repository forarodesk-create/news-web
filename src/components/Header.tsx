import { useState, useEffect } from 'react';
import { Search, MapPin, Bookmark, Flame, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BANGLA_CATEGORIES, MOCK_DISTRICTS } from '../data/newsData';
import { NewsItem } from '../types';
import { getBanglaGregorianDate, getBengaliCalendarDate } from '../utils/dateHelper';

interface HeaderProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  breakingNews: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
  isViewingBookmarks: boolean;
  setIsViewingBookmarks: (val: boolean) => void;
  selectedDistrict: string;
  setSelectedDistrict: (dist: string) => void;
  onLogoClick?: () => void;
}

const DISTRICT_WEATHER: Record<string, { temp: string; condition: string }> = {
  'ঢাকা': { temp: '৩২° সে.', condition: 'আংশিক মেঘলা' },
  'চট্টগ্রাম': { temp: '৩০° সে.', condition: 'বজ্রবৃষ্টির সম্ভাবনা' },
  'সিলেট': { temp: '২৮° সে.', condition: 'ভারী বৃষ্টি' },
  'রাজশাহী': { temp: '৩৫° সে.', condition: 'রৌদ্রোজ্জ্বল' },
  'খুলনা': { temp: '৩১° সে.', condition: 'মেঘলা আকাশ' },
  'বরিশাল': { temp: '২৯° সে.', condition: 'হালকা বৃষ্টি' },
  'রংপুর': { temp: '৩৩° সে.', condition: 'গরম ও আর্দ্র' },
  'ময়মনসিংহ': { temp: '৩০° সে.', condition: 'বজ্রপাতসহ ঝড়' },
  'কক্সবাজার': { temp: '২৯° সে.', condition: 'উত্তাল সাগর ও বৃষ্টি' }
};

export default function Header({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  breakingNews,
  onSelectNews,
  isViewingBookmarks,
  setIsViewingBookmarks,
  selectedDistrict,
  setSelectedDistrict,
  onLogoClick
}: HeaderProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentWeather = DISTRICT_WEATHER[selectedDistrict] || DISTRICT_WEATHER['ঢাকা'];

  return (
    <header className="bg-paper-light border-b border-paper-border shadow-sm">
      {/* Top Bar (Metadata, District, Search) */}
      <div className="max-w-7xl mx-auto px-4 py-2 text-xs border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2">
        {/* Left Side: Dates & Location */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 font-medium">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-brand-red" />
            <span>{getBanglaGregorianDate(currentDate)}</span>
          </div>
          <span className="hidden md:inline text-gray-300">|</span>
          <div className="text-gray-700 font-semibold bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-100">
            {getBengaliCalendarDate(currentDate)}
          </div>
          <span className="text-gray-300">|</span>
          
          {/* District Selector Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
              className="flex items-center gap-1 text-brand-blue hover:text-brand-red font-semibold cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedDistrict}</span>
            </button>
            
            <AnimatePresence>
              {districtDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDistrictDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-56 overflow-y-auto"
                  >
                    {MOCK_DISTRICTS.map((district) => (
                      <button
                        key={district}
                        onClick={() => {
                          setSelectedDistrict(district);
                          setDistrictDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 text-xs text-gray-700 transition ${
                          selectedDistrict === district ? 'bg-red-50 text-brand-red font-bold' : ''
                        }`}
                      >
                        {district}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons & Search */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Bookmarks Toggle Button */}
          <button
            id="bookmarks-toggle-btn"
            onClick={() => {
              setIsViewingBookmarks(!isViewingBookmarks);
              setActiveCategory('all');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition cursor-pointer ${
              isViewingBookmarks
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isViewingBookmarks ? 'fill-current' : ''}`} />
            <span>বুকমার্কস</span>
          </button>

          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial">
            <input
              id="search-input"
              type="text"
              placeholder="খবর খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs w-full sm:w-44 bg-gray-100 border border-transparent hover:bg-gray-200/70 focus:bg-white focus:border-gray-300 focus:ring-0 rounded-md transition outline-none"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Newspaper Branding */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        {/* Left column info */}
        <div className="hidden md:flex flex-col text-[11px] text-gray-500 font-medium w-1/4">
          <span>অনলাইন সংস্করণ</span>
          <span className="text-brand-blue font-semibold flex items-center gap-0.5">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> সত্যের সন্ধানে অবিরত
          </span>
        </div>

        {/* Central Logo */}
        <div className="flex flex-col items-center justify-center flex-1 cursor-pointer" onClick={() => {
          setIsViewingBookmarks(false);
          setActiveCategory('all');
          setSearchQuery('');
          if (onLogoClick) {
            onLogoClick();
          }
        }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 font-sans select-none italic">
            <span className="text-brand-red">বাংলাদেশ</span> <span className="text-brand-blue underline decoration-brand-red decoration-4 underline-offset-4">খবর</span>
          </h1>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-gray-500 mt-1 font-semibold">
            The Premier Independent News Portal of Bangladesh
          </p>
        </div>

        {/* Right column info */}
        <div className="md:w-1/4 flex flex-col items-center md:items-end text-[11px] text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-800 font-bold">{selectedDistrict}</span>
            <span className="text-brand-blue font-semibold">{currentWeather.temp}</span>
            <span>{currentWeather.condition}</span>
          </div>
          <span className="text-[10px] text-gray-400">আপডেট: কিছুক্ষণ আগে</span>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="border-y border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <div className="flex justify-start md:justify-center items-center py-2 min-w-max">
            {BANGLA_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setIsViewingBookmarks(false);
                  setActiveCategory(category.id);
                  setSearchQuery('');
                }}
                className={`px-4 py-1.5 text-sm font-semibold transition cursor-pointer relative ${
                  !isViewingBookmarks && activeCategory === category.id
                    ? 'text-brand-red'
                    : 'text-gray-700 hover:text-brand-red'
                }`}
              >
                {category.label}
                {!isViewingBookmarks && activeCategory === category.id && (
                  <motion.div
                    layoutId="activeCategoryIndicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-red"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Breaking News Ticker (Animated & Clickable) */}
      <div className="bg-brand-red text-white flex items-stretch text-xs h-10 overflow-hidden">
        <div className="bg-white text-brand-red font-black px-3 py-1 text-xs flex items-center gap-1 z-10 whitespace-nowrap my-1.5 ml-4 rounded shadow-sm self-center">
          <Flame className="w-3.5 h-3.5 animate-bounce text-brand-red fill-current" />
          <span>ব্রেকিং নিউজ</span>
        </div>
        
        <div className="ticker-wrap flex-1 flex items-center relative overflow-hidden">
          <div className="ticker-content flex items-center gap-12 text-white font-medium pr-12">
            {breakingNews.map((news) => (
              <button
                key={`ticker-${news.id}`}
                onClick={() => onSelectNews(news)}
                className="flex items-center gap-1.5 hover:text-red-200 cursor-pointer transition select-none text-left"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white block shrink-0" />
                <span>{news.title}</span>
              </button>
            ))}
            {/* Duplicate for seamless loop */}
            {breakingNews.map((news) => (
              <button
                key={`ticker-dup-${news.id}`}
                onClick={() => onSelectNews(news)}
                className="flex items-center gap-1.5 hover:text-red-200 cursor-pointer transition select-none text-left"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white block shrink-0" />
                <span>{news.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
