import { useState, useEffect } from 'react';
import { Flame, Star, Award, TrendingUp, Vote, Landmark, HelpCircle, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsItem, Poll } from '../types';
import { convertToBanglaNumber } from '../utils/dateHelper';

interface WidgetsProps {
  trendingNews: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
}

export default function Widgets({ trendingNews, onSelectNews }: WidgetsProps) {
  // --- Live Cricket Score Simulator ---
  const [cricketScore, setCricketScore] = useState({
    runs: 142,
    wickets: 4,
    overs: 17.2,
    batsman1: 'লিটন দাস (৪২*)',
    batsman2: 'তাওহীদ হৃদয় (১৫)',
    bowler: 'জাসপ্রিত বুমরাহ (৩.২-০-২৪-২)',
    status: 'বাংলাদেশ জয়ের জন্য ১৮ বলে ২৪ রান প্রয়োজন'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCricketScore((prev) => {
        let currentOvers = prev.overs;
        let currentRuns = prev.runs;
        let currentWickets = prev.wickets;

        // Advance ball
        let ball = Math.round((currentOvers % 1) * 10);
        ball += 1;
        if (ball >= 6) {
          currentOvers = Math.floor(currentOvers) + 1;
        } else {
          currentOvers = Math.floor(currentOvers) + ball / 10;
        }

        // Random action
        const randomAction = Math.random();
        let actionText = '';
        if (randomAction < 0.1) {
          // Wicket!
          if (currentWickets < 10) {
            currentWickets += 1;
            actionText = 'উইকেট! নতুন ব্যাটার মাঠে আসছেন';
          }
        } else if (randomAction < 0.3) {
          // Six!
          currentRuns += 6;
          actionText = 'দুর্দান্ত ছক্কা! গ্যালারিতে গর্জন!';
        } else if (randomAction < 0.5) {
          // Four!
          currentRuns += 4;
          actionText = 'অসাধারণ চার! বাউন্ডারি পার!';
        } else if (randomAction < 0.8) {
          // 1 or 2 runs
          const r = Math.random() > 0.5 ? 2 : 1;
          currentRuns += r;
          actionText = `সিঙ্গেল নিয়ে স্ট্রাইক বদল`;
        } else {
          // Dot ball
          actionText = 'ডট বল, দারুণ বল করলেন বোলার';
        }

        // Check victory scenario mock limit
        if (currentRuns >= 166) {
          return {
            runs: 166,
            wickets: currentWickets,
            overs: 18.1,
            batsman1: 'লিটন দাস (৫৬*)',
            batsman2: 'তাওহীদ হৃদয় (২৪*)',
            bowler: 'খেলা সমাপ্ত',
            status: 'বাংলাদেশ ৪ উইকেটে জয়ী! সিরিজ নিজেদের করল টিম টাইগার্স!'
          };
        }

        return {
          runs: currentRuns,
          wickets: currentWickets,
          overs: parseFloat(currentOvers.toFixed(1)),
          batsman1: `লিটন দাস (${prev.runs > 150 ? '৫১' : '৪২'}*)`,
          batsman2: 'তাওহীদ হৃদয় (১৫)',
          bowler: 'জাসপ্রিত বুমরাহ',
          status: actionText
        };
      });
    }, 8000); // update score every 8 seconds

    return () => clearInterval(interval);
  }, []);

  // --- Interactive Poll of the Day ---
  const [poll, setPoll] = useState<Poll>({
    id: 'p-1',
    question: 'আপনি কি মনে করেন সুন্দরবনে বাঘের সংখ্যা বৃদ্ধি দেশের পরিবেশ সংরক্ষণের জন্য একটি বড় মাইলফলক?',
    options: [
      { id: 'opt1', text: 'হ্যাঁ, এটি চরম ইতিবাচক উদ্যোগ', votes: 412 },
      { id: 'opt2', text: 'না, এটি তেমন কোনো বড় বিষয় নয়', votes: 45 },
      { id: 'opt3', text: 'মন্তব্য নেই / নিশ্চিত নই', votes: 23 }
    ]
  });
  const [hasVoted, setHasVoted] = useState(false);
  const [userVoteId, setUserVoteId] = useState('');

  // Load vote from localStorage on mount
  useEffect(() => {
    const savedVote = localStorage.getItem('bangla_news_poll_vote');
    if (savedVote) {
      setHasVoted(true);
      setUserVoteId(savedVote);
      // Increment option vote in local display state
      setPoll(prev => ({
        ...prev,
        options: prev.options.map(opt => 
          opt.id === savedVote ? { ...opt, votes: opt.votes + 1 } : opt
        )
      }));
    }
  }, []);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    localStorage.setItem('bangla_news_poll_vote', optionId);
    setHasVoted(true);
    setUserVoteId(optionId);
    setPoll((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  // --- Market Rates Block ---
  const bdtRates = [
    { name: 'ইউএস ডলার (USD)', rate: '১১৭.৫০ টাকা', change: '+০.২০' },
    { name: 'সৌদি রিয়াল (SAR)', rate: '৩১.৩২ টাকা', change: '-০.০৫' },
    { name: 'ইউরো (EUR)', rate: '১২৬.৪০ টাকা', change: '+০.১৫' },
    { name: 'স্বর্ণ (২২ ক্যারেট / ভরি)', rate: '১,১২,৫০০ টাকা', change: '+৭৫০' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Live Cricket Match Score Widget */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="bg-emerald-900 px-4 py-2.5 flex justify-between items-center text-white">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">সরাসরি স্কোরবোর্ড</span>
          </div>
          <span className="bg-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">টি-২০ সিরিজ</span>
        </div>

        <div className="p-4 bg-emerald-950 text-white font-sans">
          <div className="text-center text-[11px] text-emerald-300 font-semibold uppercase tracking-wider mb-2">
            ৩য় টি-টোয়েন্টি • শেরেবাংলা ক্রিকেট স্টেডিয়াম
          </div>

          <div className="flex justify-between items-center my-3">
            <div>
              <div className="text-sm font-bold text-gray-200 flex items-center gap-1">
                <span className="w-4 h-3 bg-red-600 block rounded-[1px] relative overflow-hidden shrink-0"><span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-green-600"></span></span>
                বাংলাদেশ
              </div>
              <div className="text-[10px] text-emerald-300 mt-0.5">ব্যাটিং করছে</div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-black text-white tracking-tight">
                {convertToBanglaNumber(cricketScore.runs)}/{convertToBanglaNumber(cricketScore.wickets)}
              </div>
              <div className="text-xs text-emerald-300 font-medium">
                ওভার: {convertToBanglaNumber(cricketScore.overs)}
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-900/60 my-3 pt-3 text-[11px] text-emerald-100 grid grid-cols-2 gap-2">
            <div>
              <p className="text-emerald-400 font-semibold">স্ট্রাইকে</p>
              <p className="font-medium truncate">{cricketScore.batsman1}</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold">বোলার</p>
              <p className="font-medium truncate">{cricketScore.bowler}</p>
            </div>
          </div>

          {/* Dynamic state notification */}
          <div className="bg-emerald-900/40 border border-emerald-800/50 rounded p-2 text-[11px] text-center text-amber-200 font-semibold animate-pulse">
            {cricketScore.status}
          </div>
        </div>
      </div>

      {/* 2. Trending / Read Most News List */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <h3 className="text-lg font-bold text-gray-900 border-b-2 border-brand-red pb-2 mb-4 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-brand-red" />
          <span>সর্বাধিক পঠিত খবর</span>
        </h3>

        <div className="divide-y divide-gray-100">
          {trendingNews.map((news, index) => {
            const banglaRanks = ['১', '২', '৩', '৪', '৫'];
            return (
              <div
                key={`trending-${news.id}`}
                onClick={() => onSelectNews(news)}
                className="py-3 flex gap-3 cursor-pointer hover:bg-gray-50/50 rounded px-1 transition group"
              >
                <span className={`text-xl font-extrabold w-6 text-center select-none ${
                  index === 0 ? 'text-brand-red scale-110' : 'text-gray-400'
                }`}>
                  {banglaRanks[index] || convertToBanglaNumber(index + 1)}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 group-hover:text-brand-red transition line-clamp-2 leading-snug">
                    {news.title}
                  </h4>
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <span>{news.date}</span>
                    <span>•</span>
                    <span>{convertToBanglaNumber(news.reads)} পঠিত</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Poll of the Day */}
      <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col justify-between shadow-inner border border-slate-800">
        <div className="text-center">
          <h3 className="text-lg font-light italic mb-1 text-slate-100">পোল / জনমত</h3>
          <p className="text-[11px] text-slate-400 mb-6 font-semibold leading-relaxed">
            {poll.question}
          </p>

          <div className="flex flex-col gap-3">
            {poll.options.map((option) => {
              const votePercentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
              const isUserSelection = option.id === userVoteId;

              return (
                <div key={option.id} className="relative w-full">
                  {hasVoted ? (
                    // Results Layout
                    <div className="text-xs text-left w-full">
                      <div className="flex justify-between items-center mb-1 text-slate-200">
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          {option.text}
                          {isUserSelection && <span className="text-[9px] bg-brand-red text-white px-1.5 py-0.5 rounded font-bold">আমার ভোট</span>}
                        </span>
                        <span className="font-bold text-slate-100">{convertToBanglaNumber(votePercentage)}% ({convertToBanglaNumber(option.votes)})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${votePercentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            isUserSelection ? 'bg-brand-red' : 'bg-slate-500'
                          }`}
                        />
                      </div>
                    </div>
                  ) : (
                    // Voting Layout
                    <button
                      onClick={() => handleVote(option.id)}
                      className="w-full bg-slate-800 hover:bg-slate-700 py-3 px-4 rounded-lg text-xs border border-slate-700 transition-all text-left text-slate-100 font-semibold cursor-pointer"
                    >
                      {option.text}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-[9px] text-center text-slate-500 italic mt-5">
          মোট সংগৃহীত ভোট: {convertToBanglaNumber(totalVotes)}
        </p>
      </div>

      {/* 4. Financial & Market Rates Block */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <h3 className="text-lg font-bold text-gray-900 border-b-2 border-brand-red pb-2 mb-4 flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-amber-700" />
          <span>দৈনিক বাজার দর ও মুদ্রা</span>
        </h3>

        <div className="space-y-2.5 divide-y divide-gray-100">
          {bdtRates.map((item, index) => (
            <div key={item.name} className={`flex justify-between items-center text-xs ${index > 0 ? 'pt-2' : ''}`}>
              <div>
                <span className="font-semibold text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-900 block">{item.rate}</span>
                <span className={`text-[9px] font-bold ${
                  item.change.startsWith('+') ? 'text-green-600' : 'text-red-500'
                }`}>{item.change}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-gray-400 mt-3 text-center border-t border-gray-100 pt-2">
          উৎস: বাংলাদেশ ব্যাংক ও দেশীয় বাজার • তথ্য পরিবর্তনশীল
        </div>
      </div>
    </div>
  );
}
