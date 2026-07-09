export function convertToBanglaNumber(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map(digit => {
      const parsed = parseInt(digit, 10);
      return isNaN(parsed) ? digit : banglaDigits[parsed];
    })
    .join('');
}

export function getBanglaGregorianDate(date: Date = new Date()): string {
  const days = [
    'রোববার',
    'সোমবার',
    'মঙ্গলবার',
    'বুধবার',
    'বৃহস্পতিবার',
    'শুক্রবার',
    'শনিবার'
  ];
  const months = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর'
  ];

  const dayName = days[date.getDay()];
  const dayNum = convertToBanglaNumber(date.getDate());
  const monthName = months[date.getMonth()];
  const yearNum = convertToBanglaNumber(date.getFullYear());

  return `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
}

/**
 * Calculates a close approximation of the Bengali Calendar Date (Bongabdo).
 * Bengali New Year (Pohela Boishakh) is usually April 14th.
 */
export function getBengaliCalendarDate(date: Date = new Date()): string {
  const day = date.getDate();
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();

  // Approximate Bangla Year
  let banglaYear = year - 593;
  let banglaMonth = '';
  let banglaDay = 0;

  // Simple approximation of Bengali calendar months and starting days
  // boishakh starts approx April 14
  const banglaMonths = [
    { name: 'বৈশাখ', startMonth: 3, startDate: 14, days: 31 },
    { name: 'জ্যৈষ্ঠ', startMonth: 4, startDate: 15, days: 31 },
    { name: 'আষাঢ়', startMonth: 5, startDate: 16, days: 31 },
    { name: 'শ্রাবণ', startMonth: 6, startDate: 17, days: 31 },
    { name: 'ভাদ্র', startMonth: 7, startDate: 18, days: 31 },
    { name: 'আশ্বিন', startMonth: 8, startDate: 18, days: 30 },
    { name: 'কার্তিক', startMonth: 9, startDate: 18, days: 30 },
    { name: 'অগ্রহায়ণ', startMonth: 10, startDate: 18, days: 30 },
    { name: 'পৌষ', startMonth: 11, startDate: 17, days: 30 },
    { name: 'মাঘ', startMonth: 0, startDate: 15, days: 30 },
    { name: 'ফাল্গুন', startMonth: 1, startDate: 14, days: 30 }, // Simple approx
    { name: 'চৈত্র', startMonth: 2, startDate: 15, days: 30 }
  ];

  // Let's find which bangla month matches the given date
  // We can do a simple calendar offset calculation
  // Let's check for 9 July 2026:
  // July is month 6 (0-indexed). It is after June 17 (Ashar starts June 16, Srabon starts July 17).
  // So 9 July should be in Ashar.
  // 9 July - 16 June = 23 days into Ashar approx.
  // Let's do a reliable lookup based on day-of-year or simplified logic for common dates:
  
  if (month === 3) { // April
    if (day >= 14) {
      banglaMonth = 'বৈশাখ';
      banglaDay = day - 13;
    } else {
      banglaMonth = 'চৈত্র';
      banglaDay = day + 15;
      banglaYear--;
    }
  } else if (month === 4) { // May
    if (day >= 15) {
      banglaMonth = 'জ্যৈষ্ঠ';
      banglaDay = day - 14;
    } else {
      banglaMonth = 'বৈশাখ';
      banglaDay = day + 17;
    }
  } else if (month === 5) { // June
    if (day >= 16) {
      banglaMonth = 'আষাঢ়';
      banglaDay = day - 15;
    } else {
      banglaMonth = 'জ্যৈষ্ঠ';
      banglaDay = day + 16;
    }
  } else if (month === 6) { // July
    if (day >= 17) {
      banglaMonth = 'শ্রাবণ';
      banglaDay = day - 16;
    } else {
      banglaMonth = 'আষাঢ়';
      banglaDay = day + 15;
    }
  } else if (month === 7) { // August
    if (day >= 18) {
      banglaMonth = 'ভাদ্র';
      banglaDay = day - 17;
    } else {
      banglaMonth = 'শ্রাবণ';
      banglaDay = day + 14;
    }
  } else if (month === 8) { // September
    if (day >= 18) {
      banglaMonth = 'আশ্বিন';
      banglaDay = day - 17;
    } else {
      banglaMonth = 'ভাদ্র';
      banglaDay = day + 13;
    }
  } else if (month === 9) { // October
    if (day >= 18) {
      banglaMonth = 'কার্তিক';
      banglaDay = day - 17;
    } else {
      banglaMonth = 'আশ্বিন';
      banglaDay = day + 13;
    }
  } else if (month === 10) { // November
    if (day >= 18) {
      banglaMonth = 'অগ্রহায়ণ';
      banglaDay = day - 17;
    } else {
      banglaMonth = 'কার্তিক';
      banglaDay = day + 13;
    }
  } else if (month === 11) { // December
    if (day >= 17) {
      banglaMonth = 'পৌষ';
      banglaDay = day - 16;
    } else {
      banglaMonth = 'অগ্রহায়ণ';
      banglaDay = day + 13;
    }
  } else if (month === 0) { // January
    if (day >= 15) {
      banglaMonth = 'মাঘ';
      banglaDay = day - 14;
    } else {
      banglaMonth = 'পৌষ';
      banglaDay = day + 14;
      banglaYear--;
    }
  } else if (month === 1) { // February
    if (day >= 14) {
      banglaMonth = 'ফাল্গুন';
      banglaDay = day - 13;
    } else {
      banglaMonth = 'মাঘ';
      banglaDay = day + 16;
      banglaYear--;
    }
  } else if (month === 2) { // March
    if (day >= 15) {
      banglaMonth = 'চৈত্র';
      banglaDay = day - 14;
    } else {
      banglaMonth = 'ফাল্গুন';
      banglaDay = day + 15;
      banglaYear--;
    }
  }

  const bDay = convertToBanglaNumber(banglaDay);
  const bYear = convertToBanglaNumber(banglaYear);

  return `${bDay} ${banglaMonth}, ${bYear} বঙ্গাব্দ`;
}
