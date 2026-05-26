const banglaDigits = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

function convertBanglaDigits(text) {
  return text.replace(/[০-৯]/g, (match) => banglaDigits[match]);
}

export function parseTransactionText(rawText) {
  if (!rawText) return null;

  // 1. Normalize digits and convert to lowercase
  let text = convertBanglaDigits(rawText).trim();
  const lowerText = text.toLowerCase();

  // 2. Extract amount
  // Match any digits, possibly with commas/decimals
  // E.g., "1,200", "850", "25000"
  const amountPattern = /\b\d+(?:,\d+)*(?:\.\d+)?\b/g;
  const numbers = text.match(amountPattern);

  if (!numbers || numbers.length === 0) {
    return {
      success: false,
      rawText,
      error: 'No amount found'
    };
  }

  // Choose the primary amount (usually the last or only number, e.g. "Lunch 250" or "বাজার করলাম ৮৫০ টাকা")
  // Let's look for numbers that might be the amount.
  // In most voice logs, the main number represents the transaction amount. We'll take the largest/last one.
  const parsedNumbers = numbers.map(n => parseFloat(n.replace(/,/g, '')));
  // If there are multiple numbers, let's take the last one since users typically say "Description [Amount] Taka"
  const amount = parsedNumbers[parsedNumbers.length - 1];

  // 3. Clean up the description
  // Remove the amount from the text to get a clean description
  // Also remove currency words like "টাকা", "taka", "tk", "bdt"
  const currencyRegex = /\b(?:টাকা|টাকায়|taka|tk|bdt)\b/gi;
  const cleanRegex = new RegExp(`\\b${numbers[numbers.length - 1]}\\b`, 'g');
  
  let description = text
    .replace(cleanRegex, '')
    .replace(currencyRegex, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If description becomes empty, give it a default fallback
  if (!description) {
    description = 'Transaction';
  }

  // Capitalize first letter of description for readability
  description = description.charAt(0).toUpperCase() + description.slice(1);

  // 4. Classify Type & Sub-type
  let type = 'out'; // Default to expense (Money Out)
  let subtype = 'expense'; // 'expense', 'income', 'borrowed', 'lent', 'subscription'
  let person = '';

  // Keywords definition
  const incomeKeywords = [
    'salary', 'paycheck', 'income', 'bonus', 'gift', 'earned', 'earn', 'receive', 'received',
    'বেতন', 'বোনাস', 'আয়', 'পেলাম', 'পেলুম', 'যোগ', 'ইনকাম', 'আয়', 'ঢুকল', 'ঢুকলো'
  ];

  const borrowKeywords = [
    'borrowed', 'borrow', 'loan from', 'karj nilam', 'ধার নিলাম', 'করজ নিলাম', 'ধার নিলাম',
    'ধার করলাম', 'করজ', 'ঋণ নিলাম', 'ঋণ', 'nilam', 'নিলুম', 'নিলাম'
  ];

  const lentKeywords = [
    'lent', 'lend', 'loan to', 'gave to', 'dilam', 'dhilam', 'dilum',
    'ধার দিলাম', 'করজ দিলাম', 'দিলাম', 'দিলুম'
  ];

  const subscriptionKeywords = [
    'monthly', 'yearly', 'recurring', 'subscription', 'netflix', 'spotify', 'electricity bill', 'internet bill',
    'rent', 'ভাড়া', 'সাবস্ক্রিপশন', 'বিল', 'মাসিক', 'বাৎসরিক'
  ];

  const repaymentKeywords = [
    'repaid', 'repayment', 'paid back', 'returned', 'shodh', 'শোধ', 'পরিশোধ', 'ফেরত'
  ];

  // Logic to extract name (person) for debt tracking
  // Look for patterns like "to [Name]", "from [Name]", "[Name] ke", "[Name] er"
  // E.g., "borrowed from Rakib 5000" -> Rakib
  // E.g., "Rakib ke 1000 dilam" -> Rakib
  const personMatch = lowerText.match(/(?:from|to|with)\s+([a-zA-Z]+)/i) || 
                      lowerText.match(/([a-zA-Z]+)\s+(?:ke|কে|er|এর|dilam|nilam)/i);
  if (personMatch && personMatch[1]) {
    person = personMatch[1].charAt(0).toUpperCase() + personMatch[1].slice(1);
  } else {
    // Try to extract first uppercase word or first word in description if it's a debt
    const words = description.split(' ');
    if (words.length > 0 && words[0] !== 'Borrowed' && words[0] !== 'Lent' && words[0] !== 'Paid') {
      person = words[0];
    } else if (words.length > 1) {
      person = words[1];
    } else {
      person = 'Someone';
    }
  }

  // Check matching priority
  const matchesKeyword = (keywords) => {
    return keywords.some(keyword => lowerText.includes(keyword));
  };

  if (matchesKeyword(incomeKeywords)) {
    type = 'in';
    subtype = 'income';
  } else if (matchesKeyword(borrowKeywords)) {
    type = 'in'; // Borrowing brings cash IN
    subtype = 'borrowed';
  } else if (matchesKeyword(lentKeywords)) {
    type = 'out'; // Lending takes cash OUT
    subtype = 'lent';
  } else if (matchesKeyword(subscriptionKeywords)) {
    type = 'out';
    subtype = 'subscription';
  } else if (matchesKeyword(repaymentKeywords)) {
    // Repayment direction depends on context
    // "repaid Rakib" -> Outflow (type 'out')
    // "Rakib repaid me" -> Inflow (type 'in')
    if (lowerText.includes('me') || lowerText.includes('palam') || lowerText.includes('pelam') || lowerText.includes('পেলাম')) {
      type = 'in';
      subtype = 'repayment_in';
    } else {
      type = 'out';
      subtype = 'repayment_out';
    }
  }

  return {
    success: true,
    amount,
    type,
    subtype,
    description,
    person: (subtype === 'borrowed' || subtype === 'lent' || subtype.startsWith('repayment')) ? person : null,
    confidence: 0.9, // confidence score for user review
    rawText
  };
}
