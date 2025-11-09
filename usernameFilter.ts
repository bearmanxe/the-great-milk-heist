// Username content filtering system
// This prevents users from creating inappropriate usernames

// List of blocked words and patterns
const blockedWords = [
  // Common profanity
  'fuck', 'shit', 'ass', 'bitch', 'bastard', 'damn', 'hell',
  'crap', 'piss', 'dick', 'cock', 'pussy', 'cunt', 'whore',
  'slut', 'fag', 'dyke', 'retard', 'nigger', 'nigga', 'chink',
  'spic', 'kike', 'nazi', 'hitler',
  
  // Sexual/inappropriate terms
  'porn', 'sex', 'sexy', 'nude', 'naked', 'rape', 'molest',
  'penis', 'vagina', 'boob', 'tit', 'cum', 'jizz', 'orgasm',
  
  // Drug references
  'weed', 'cocaine', 'heroin', 'meth', 'drug',
  
  // Violence
  'kill', 'murder', 'suicide', 'bomb', 'terrorist',
  
  // Scam/spam indicators
  'admin', 'moderator', 'official', 'support', 'staff',
  'bot', 'system',
  
  // Common leetspeak variations will be caught by normalization
];

// Patterns to detect leetspeak and character substitution
const leetspeakMap: { [key: string]: string[] } = {
  'a': ['4', '@', 'a'],
  'e': ['3', 'e'],
  'i': ['1', '!', 'i'],
  'o': ['0', 'o'],
  's': ['5', '$', 's'],
  't': ['7', '+', 't'],
  'l': ['1', '|', 'l'],
  'g': ['9', '6', 'g'],
  'b': ['8', 'b'],
  'z': ['2', 'z'],
};

// Normalize username to catch leetspeak variations
function normalizeUsername(username: string): string {
  let normalized = username.toLowerCase();
  
  // Remove common separators
  normalized = normalized.replace(/[-_\.]/g, '');
  
  // Convert leetspeak to normal letters
  normalized = normalized
    .replace(/4|@/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1|!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5|\$/g, 's')
    .replace(/7|\+/g, 't')
    .replace(/9|6/g, 'g')
    .replace(/8/g, 'b')
    .replace(/2/g, 'z');
  
  return normalized;
}

// Check if username contains blocked content
export function isUsernameAppropriate(username: string): { 
  isValid: boolean; 
  reason?: string;
} {
  if (!username) {
    return { isValid: false, reason: 'Username cannot be empty' };
  }

  // Normalize the username to catch variations
  const normalized = normalizeUsername(username);
  
  // Check against blocked words
  for (const word of blockedWords) {
    if (normalized.includes(word)) {
      return { 
        isValid: false, 
        reason: 'Username contains inappropriate content. Please choose a different username.' 
      };
    }
  }
  
  // Check for repeated characters (spam pattern like "aaaaa")
  if (/(.)\1{4,}/.test(username)) {
    return { 
      isValid: false, 
      reason: 'Username cannot contain more than 4 repeated characters.' 
    };
  }
  
  // Check for excessive numbers (spam pattern like "12345678")
  const numberCount = (username.match(/\d/g) || []).length;
  if (numberCount > username.length * 0.7) {
    return { 
      isValid: false, 
      reason: 'Username contains too many numbers.' 
    };
  }
  
  // Check for common spam patterns
  const spamPatterns = [
    /(.{2,})\1{2,}/, // Repeated patterns like "abcabcabc"
    /^[0-9]+$/, // Only numbers
    /^[^a-zA-Z0-9]+$/, // Only special characters
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(username)) {
      return { 
        isValid: false, 
        reason: 'Username format is not allowed. Please use a mix of letters and numbers.' 
      };
    }
  }
  
  // Check for impersonation attempts
  const impersonationWords = ['admin', 'mod', 'moderator', 'support', 'official', 'staff', 'bot', 'system'];
  for (const word of impersonationWords) {
    if (normalized.includes(word)) {
      return { 
        isValid: false, 
        reason: 'Username cannot impersonate staff or system accounts.' 
      };
    }
  }
  
  return { isValid: true };
}

// Suggest alternative usernames if blocked
export function suggestAlternativeUsernames(baseUsername: string): string[] {
  const suggestions: string[] = [];
  const cleanBase = baseUsername.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
  
  if (cleanBase.length < 3) {
    return [
      'MilkHero',
      'CowDefender',
      'DairyKnight',
      'MilkWarrior',
      'LacticLegend'
    ];
  }
  
  // Generate some random suggestions
  const suffixes = ['123', '456', '789', 'Pro', 'King', 'Boss', 'Hero', 'Star'];
  const prefixes = ['Epic', 'Cool', 'Super', 'Mega', 'Ultra'];
  
  for (let i = 0; i < 3; i++) {
    const randomNum = Math.floor(Math.random() * 1000);
    suggestions.push(`${cleanBase}${randomNum}`);
  }
  
  suggestions.push(`${prefixes[Math.floor(Math.random() * prefixes.length)]}${cleanBase}`);
  suggestions.push(`${cleanBase}${suffixes[Math.floor(Math.random() * suffixes.length)]}`);
  
  return suggestions.slice(0, 5);
}
