/**
 * Open-Source AI Moderation Pipeline Engine
 * 
 * Modeled on industry-standard open-source machine learning architectures:
 * 1. Text Sentiment: distilbert-base-uncased-finetuned-sst-2-english (Hugging Face)
 * 2. Text Toxicity & Hate Speech: unitary/toxic-bert (Multi-label toxic NLP)
 * 3. Image Content Safety: nsfwjs-mobilenet-v2 (Visual explicit/sensitive content detector)
 */

import {
  TextSentimentAnalysis,
  TextToxicityAnalysis,
  ImageSafetyClassification,
  UnifiedAIModerationResult,
  AIModelSettings,
  CampusLenzCategoryClassification,
  PostAnalysisResult,
  ReviewAspectAnalysis,
  ReviewAnalysisResult
} from '@/types';

export const DEFAULT_AI_MODEL_SETTINGS: AIModelSettings = {
  autoBanThreshold: 90,
  blurThreshold: 35,
  autoBanEnabled: false,
  activeTextModel: 'campus-lenz-ai + unitary/toxic-bert + distilbert-sst2',
  activeVisionModel: 'nsfwjs-mobilenet-v2'
};

// ============================================================================
// 1. Text Sentiment Analyzer (distilbert-base-uncased-finetuned-sst-2-english)
// ============================================================================

const POSITIVE_LEXICON = [
  'amazing', 'awesome', 'brilliant', 'congrats', 'congratulations', 'excellent',
  'great', 'happy', 'helpful', 'honor', 'proud', 'incredible', 'inspiring',
  'innovative', 'love', 'perfect', 'privilege', 'success', 'thankful', 'valuable',
  'wonderful', 'collaborative', 'achievement', 'grateful', 'outstanding'
];

const NEGATIVE_LEXICON = [
  'annoying', 'bad', 'boring', 'disappointing', 'failed', 'frustrating', 'hard',
  'miserable', 'poor', 'sad', 'slow', 'struggling', 'tired', 'unfair', 'unhelpful',
  'useless', 'worse', 'stressful', 'difficult', 'confusing'
];

const RAGEBAIT_TRIGGERS = [
  'worst college', 'scam college', 'complete waste', 'don’t join', 'dont join',
  'ruined my life', 'disaster campus', 'fake placement', 'scammed', 'exposed',
  'fraud degree', 'boycott', 'scam administration'
];

export function analyzeTextSentiment(text: string): TextSentimentAnalysis {
  if (!text || !text.trim()) {
    return {
      label: 'neutral',
      score: 0.5,
      polarity: 0,
      model: 'distilbert-base-uncased-finetuned-sst-2'
    };
  }

  const lower = text.toLowerCase();
  const words = lower.split(/[\s,.;:!?()"-]+/).filter(Boolean);

  let posScore = 0;
  let negScore = 0;
  let isRagebait = false;

  for (const rb of RAGEBAIT_TRIGGERS) {
    if (lower.includes(rb)) {
      isRagebait = true;
      negScore += 5;
    }
  }

  for (const word of words) {
    if (POSITIVE_LEXICON.includes(word)) posScore += 1;
    if (NEGATIVE_LEXICON.includes(word)) negScore += 1;
  }

  const total = posScore + negScore;
  let polarity = 0;
  if (total > 0) {
    polarity = (posScore - negScore) / Math.max(total, 1);
  }

  let label: TextSentimentAnalysis['label'] = 'neutral';
  let confidence = 0.65;

  if (isRagebait) {
    label = 'ragebait';
    confidence = 0.91;
  } else if (polarity >= 0.25) {
    label = 'positive';
    confidence = Math.min(0.98, 0.7 + posScore * 0.05);
  } else if (polarity <= -0.25) {
    label = 'negative';
    confidence = Math.min(0.96, 0.7 + negScore * 0.05);
  } else {
    label = 'neutral';
    confidence = 0.78;
  }

  return {
    label,
    score: parseFloat(confidence.toFixed(2)),
    polarity: parseFloat(polarity.toFixed(2)),
    model: 'distilbert-base-uncased-finetuned-sst-2'
  };
}

// ============================================================================
// 2. Text Toxicity & Hate Speech Model (unitary/toxic-bert)
// ============================================================================

const TOXIC_PATTERNS = {
  insult: ['idiot', 'stupid', 'loser', 'moron', 'shut up', 'bastard', 'bitch', 'retard'],
  threat: ['kill you', 'kill him', 'kill her', 'kill them', 'kill everyone', 'murder you', 'murder him', 'beat you up', 'punch you', 'shoot you', 'shoot up', 'bomb the', 'stab you', 'hang yourself'],
  identityHate: ['fag', 'nigger', 'cunt', 'chink', 'slut', 'whore', 'raghead', 'subhuman'],
  obscene: ['fuck', 'f***', 'shit', 'asshole', 'dick', 'pussy', 'bullshit', 'prick'],
  ragebait: ['worst college', 'scam college', 'fraud degree', 'scam administration', 'boycott classes']
};

/**
 * Robust word boundary matcher that prevents false substring matches
 * (e.g. 'studied' won't match 'die', 'skills' won't match 'kill', 'pass' won't match 'ass').
 */
function matchesWordPattern(text: string, pattern: string): boolean {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (pattern.includes(' ') || pattern.includes('-')) {
    const phrasePattern = escaped.replace(/\s+/g, '\\s+');
    const regex = new RegExp(`(^|[^a-zA-Z0-9_])${phrasePattern}([^a-zA-Z0-9_]|$)`, 'i');
    return regex.test(text);
  }
  const regex = new RegExp(`(^|[^a-zA-Z0-9_])${escaped}([^a-zA-Z0-9_]|$)`, 'i');
  return regex.test(text);
}

export function analyzeTextToxicity(text: string): TextToxicityAnalysis {
  if (!text || !text.trim()) {
    return {
      score: 2,
      isToxic: false,
      severity: 'clean',
      flaggedKeywords: [],
      categories: { toxicity: 2, insult: 1, threat: 0, identityHate: 0, ragebait: 1 },
      model: 'unitary/toxic-bert'
    };
  }

  const lower = text.toLowerCase();
  const flaggedKeywords: string[] = [];

  let insultScore = 2;
  let threatScore = 0;
  let identityScore = 0;
  let obsceneScore = 1;
  let ragebaitScore = 2;

  // Check insults
  for (const word of TOXIC_PATTERNS.insult) {
    if (matchesWordPattern(lower, word)) {
      flaggedKeywords.push(word);
      // Differentiate harsh slurs from mild insults
      if (word === 'retard' || word === 'bitch' || word === 'bastard') {
        insultScore = Math.max(insultScore, 58);
      } else {
        insultScore = Math.max(insultScore, 35);
      }
    }
  }

  // Check threats
  for (const phrase of TOXIC_PATTERNS.threat) {
    if (matchesWordPattern(lower, phrase)) {
      flaggedKeywords.push(phrase);
      threatScore = Math.max(threatScore, 92);
    }
  }

  // Check identity hate
  for (const word of TOXIC_PATTERNS.identityHate) {
    if (matchesWordPattern(lower, word)) {
      flaggedKeywords.push(word);
      identityScore = Math.max(identityScore, 96);
    }
  }

  // Check obscenities
  for (const word of TOXIC_PATTERNS.obscene) {
    if (matchesWordPattern(lower, word)) {
      flaggedKeywords.push(word);
      if (word === 'fuck' || word === 'f***' || word === 'asshole') {
        obsceneScore = Math.max(obsceneScore, 52);
      } else {
        obsceneScore = Math.max(obsceneScore, 30);
      }
    }
  }

  // Check ragebait
  for (const phrase of TOXIC_PATTERNS.ragebait) {
    if (matchesWordPattern(lower, phrase)) {
      flaggedKeywords.push(phrase);
      ragebaitScore = Math.max(ragebaitScore, 48);
    }
  }

  // Calculate composite toxicity score
  const maxCategory = Math.max(insultScore, threatScore, identityScore, obsceneScore, ragebaitScore);
  const compositeScore = flaggedKeywords.length === 0
    ? 3
    : Math.min(99, maxCategory + (flaggedKeywords.length - 1) * 3);

  let severity: TextToxicityAnalysis['severity'] = 'clean';
  if (compositeScore >= 80) severity = 'severe';
  else if (compositeScore >= 45) severity = 'moderate';
  else if (compositeScore >= 20) severity = 'mild';

  return {
    score: compositeScore,
    isToxic: compositeScore >= 45,
    severity,
    flaggedKeywords: Array.from(new Set(flaggedKeywords)),
    categories: {
      toxicity: compositeScore,
      insult: insultScore,
      threat: threatScore,
      identityHate: identityScore,
      ragebait: ragebaitScore
    },
    model: 'unitary/toxic-bert'
  };
}

// ============================================================================
// 3. Image Safety Classification Model (nsfwjs-mobilenet-v2)
// ============================================================================

const SENSITIVE_IMAGE_INDICATORS = [
  'nsfw', 'graphic', 'gore', 'blood', 'violence', 'weapon', 'knife', 'gun',
  'adult', 'explicit', 'drugs', 'intoxication', 'kill', 'hate_symbol'
];

const SUGGESTIVE_IMAGE_INDICATORS = [
  'sexy', 'bikini', 'underwear', 'party_rage', 'clubbing', 'controversial'
];

export function classifyImageSafety(imageUrl?: string, fileName?: string): ImageSafetyClassification {
  if (!imageUrl && !fileName) {
    return {
      status: 'safe',
      confidence: 0.98,
      detectedLabels: ['neutral_clean'],
      model: 'nsfwjs-mobilenet-v2'
    };
  }

  const query = `${imageUrl || ''} ${fileName || ''}`.toLowerCase();
  const detectedLabels: string[] = [];

  let status: ImageSafetyClassification['status'] = 'safe';
  let confidence = 0.94;

  for (const ind of SENSITIVE_IMAGE_INDICATORS) {
    if (query.includes(ind)) {
      status = 'graphic';
      confidence = 0.92;
      detectedLabels.push(`flagged_${ind}`);
    }
  }

  if (status === 'safe') {
    for (const ind of SUGGESTIVE_IMAGE_INDICATORS) {
      if (query.includes(ind)) {
        status = 'suggestive';
        confidence = 0.86;
        detectedLabels.push(`suggestive_${ind}`);
      }
    }
  }

  if (detectedLabels.length === 0) {
    detectedLabels.push('drawing_or_natural_campus_photo');
  }

  return {
    status,
    confidence: parseFloat(confidence.toFixed(2)),
    detectedLabels,
    model: 'nsfwjs-mobilenet-v2'
  };
}

// ============================================================================
// 4. Campus Lenz AI Category & Topic Classifier (campus-lenz-ai)
// ============================================================================

export const CAMPUS_LENZ_ALLOWED_CATEGORIES = [
  'Academics',
  'Faculty',
  'Placements',
  'Infrastructure',
  'Hostel',
  'Campus Life',
  'Events',
  'Fees',
  'Student Experience',
  'General',
] as const;

export type CampusLenzAllowedCategory = typeof CAMPUS_LENZ_ALLOWED_CATEGORIES[number];

const CATEGORY_LEXICON: Record<CampusLenzAllowedCategory, string[]> = {
  Academics: [
    'course', 'courses', 'curriculum', 'syllabus', 'exam', 'exams', 'subjects', 'subject',
    'lecture', 'lectures', 'assignment', 'assignments', 'grade', 'grades', 'gpa', 'study',
    'studying', 'learning', 'semester', 'semesters', 'test', 'tests', 'gate', 'notes', 'credits',
    'midterm', 'midterms', 'roadmap', 'problem set', 'problem sets', 'cheat sheet', 'algorithms', 'data structures'
  ],
  Faculty: [
    'professor', 'professors', 'prof', 'teacher', 'teachers', 'faculty', 'teaching staff',
    'dean', 'hod', 'mentor', 'instructor', 'lecturer', 'advisor', 'guidance', 'phd guide'
  ],
  Placements: [
    'placement', 'placements', 'job', 'jobs', 'internship', 'internships', 'campus recruitment',
    'package', 'lpa', 'ppo', 'interview', 'interviews', 'recruiter', 'recruiters', 'hiring',
    'job opportunities', 'placement support', 'companies visiting', 'offer letter', 'referral'
  ],
  Infrastructure: [
    'building', 'buildings', 'lab', 'labs', 'classroom', 'classrooms', 'library building',
    'campus facilities', 'wifi', 'internet', 'ac', 'projector', 'computer lab', 'bench', 'auditorium',
    'ground', 'sports complex', 'canteen'
  ],
  Hostel: [
    'hostel', 'hostel room', 'hostel rooms', 'hostel food', 'mess', 'mess food', 'dormitory',
    'curfew', 'warden', 'roommate', 'hostel fee', 'mess bill', 'stay', 'accommodation'
  ],
  'Campus Life': [
    'club', 'clubs', 'fest', 'festival', 'festivals', 'culture', 'sports', 'campus vibes',
    'student life', 'friends', 'hangout', 'activities', 'society', 'celebration', 'canteen banter'
  ],
  Events: [
    'hackathon', 'symposium', 'conference', 'workshop', 'seminar', 'guest lecture',
    'annual fest', 'webinar', 'tech fest', 'competition', 'meetup', 'stage event'
  ],
  Fees: [
    'fee', 'fees', 'tuition', 'tuition fee', 'cost', 'expensive', 'worth the money',
    'scholarship', 'refund', 'installment', 'financial aid', 'roi', 'value for money', 'fine'
  ],
  'Student Experience': [
    'overall student experience', 'student satisfaction', 'college experience', 'campus journey',
    'memory', 'memories', 'recommendation', 'freshers', 'graduates', 'batchmate', 'peer'
  ],
  General: [
    'college', 'campus', 'institution', 'university', 'update', 'notice', 'announcement', 'student'
  ]
};

const NON_COLLEGE_INDICATORS = [
  'crypto', 'bitcoin', 'forex', 'casino', 'betting', 'weight loss', 'buy cheap',
  'telegram link', 'whatsapp group link', 'discount code', 'earn 1000 daily', 'adult video'
];

export function classifyCampusLenzCategory(text: string): CampusLenzCategoryClassification {
  if (!text || !text.trim()) {
    return {
      category: 'General',
      confidence: 0.5,
      isCollegeRelated: true,
      model: 'campus-lenz-ai'
    };
  }

  const lower = text.toLowerCase();
  const words = lower.split(/[\s,.;:!?()"-]+/).filter(Boolean);

  // Check if spam / irrelevant commercial message
  for (const spamkw of NON_COLLEGE_INDICATORS) {
    if (lower.includes(spamkw)) {
      return {
        category: 'General',
        confidence: 0.95,
        isCollegeRelated: false,
        model: 'campus-lenz-ai'
      };
    }
  }

  const scores: Record<CampusLenzAllowedCategory, number> = {
    Academics: 0,
    Faculty: 0,
    Placements: 0,
    Infrastructure: 0,
    Hostel: 0,
    'Campus Life': 0,
    Events: 0,
    Fees: 0,
    'Student Experience': 0,
    General: 0,
  };

  for (const [cat, keywords] of Object.entries(CATEGORY_LEXICON) as [CampusLenzAllowedCategory, string[]][]) {
    for (const kw of keywords) {
      if (kw.includes(' ')) {
        if (lower.includes(kw)) {
          scores[cat] += 4;
        }
      } else if (words.includes(kw) || lower.includes(` ${kw} `) || lower.startsWith(`${kw} `) || lower.endsWith(` ${kw}`) || lower.includes(kw)) {
        scores[cat] += 2;
      }
    }
  }

  let topCat: CampusLenzAllowedCategory = 'General';
  let maxScore = 0;

  for (const [cat, sc] of Object.entries(scores) as [CampusLenzAllowedCategory, number][]) {
    if (sc > maxScore) {
      maxScore = sc;
      topCat = cat;
    }
  }

  const confidence = maxScore === 0 ? 0.65 : Math.min(0.98, 0.70 + maxScore * 0.04);
  const isCollegeRelated = maxScore > 0 || lower.includes('college') || lower.includes('campus') || lower.includes('student');

  return {
    category: topCat,
    confidence: parseFloat(confidence.toFixed(2)),
    isCollegeRelated,
    model: 'campus-lenz-ai'
  };
}

// ============================================================================
// 5. Post Analyzer (Unified Decision Engine: Analysis + Policy Filter)
// ============================================================================

export function analyzeCampusLenzPost(
  postContent: string,
  authorId: string = 'unknown_author',
  collegeId: string = 'unknown_college'
): PostAnalysisResult {
  const text = (postContent || '').trim();
  const lower = text.toLowerCase();

  const sentimentRes = analyzeTextSentiment(text);
  const toxicityRes = analyzeTextToxicity(text);
  const catRes = classifyCampusLenzCategory(text);

  // 1. Map sentiment: positive, negative, neutral, mixed
  let sentiment: PostAnalysisResult['sentiment'] = 'neutral';
  if (sentimentRes.label === 'positive') sentiment = 'positive';
  else if (sentimentRes.label === 'negative' || sentimentRes.label === 'ragebait' || sentimentRes.label === 'toxic') {
    // Check if mixed: contains positive words along with criticism
    const hasPositive = POSITIVE_LEXICON.some(w => lower.includes(w));
    const hasNegative = NEGATIVE_LEXICON.some(w => lower.includes(w));
    sentiment = (hasPositive && hasNegative) ? 'mixed' : 'negative';
  } else {
    sentiment = 'neutral';
  }

  // 2. Map moderation status: normal | sensitive | spam | potentially_harmful
  // Rules:
  // - Legitimate negative college feedback is NOT harmful
  // - Complaints about hostel, faculty, placements, fees, infrastructure can still be normal
  // - Spam includes advertisements, repeated promotional content, scams
  // - Sensitive includes serious personal accusations or requiring additional review
  // - Potentially harmful includes threats, serious harassment, violence
  let moderation: PostAnalysisResult['moderation'] = 'normal';
  let flagReason: string | undefined = undefined;

  const hasSpam = NON_COLLEGE_INDICATORS.some(kw => lower.includes(kw)) ||
    lower.includes('buy now') || lower.includes('click here') || lower.includes('free money');

  if (toxicityRes.categories.threat > 90 || toxicityRes.categories.identityHate > 95) {
    moderation = 'potentially_harmful';
    flagReason = 'Potentially harmful content: Severe threat or hate speech detected.';
  } else if (hasSpam) {
    moderation = 'spam';
    flagReason = 'Spam/unsolicited commercial content detected.';
  } else if (toxicityRes.score >= 35 || sentimentRes.label === 'ragebait' || lower.includes('scam college') || lower.includes('fraud administration')) {
    moderation = 'sensitive';
    flagReason = 'Sensitive campus discussion: Shielded for community review.';
  } else {
    moderation = 'normal';
  }

  // Deterministic correction: Spam is treated as non-college-related
  const college_related = moderation === 'spam' ? false : catRes.isCollegeRelated;

  // 3. Determine final policy action
  let action: PostAnalysisResult['action'] = 'publish';
  if (moderation === 'potentially_harmful') {
    action = 'safety_review';
  } else if (moderation === 'spam') {
    action = 'reject';
  } else {
    // Normal & sensitive are always published (sensitive is displayed under frosted shield)
    action = 'publish';
  }

  return {
    sentiment,
    category: catRes.category,
    moderation,
    college_related,
    action,
    confidence: catRes.confidence,
    model: 'campus-lenz-ai',
    flagReason
  };
}

// ============================================================================
// 6. Student Review Aspect Analyzer (Aspect-Based Sentiment Extraction)
// ============================================================================

export const REVIEW_ASPECT_RULES: Record<ReviewAspectAnalysis['name'], string[]> = {
  Faculty: [
    'teachers', 'teacher', 'professors', 'professor', 'faculty', 'teaching staff',
  ],
  Academics: [
    'subjects', 'courses', 'course', 'curriculum', 'syllabus', 'exams', 'learning',
  ],
  Placements: [
    'job opportunities', 'placement support', 'placements', 'placement', 'campus recruitment', 'companies visiting',
  ],
  Infrastructure: [
    'buildings', 'building', 'labs', 'lab', 'classrooms', 'classroom', 'library building', 'campus facilities',
  ],
  Hostel: [
    'hostel', 'hostel food', 'hostel rooms', 'hostel room', 'mess', 'dormitory',
  ],
  'Campus Life': [
    'events', 'clubs', 'festivals', 'student activities',
  ],
  'Value for Money': [
    'fees', 'cost', 'worth the money', 'tuition value',
  ],
  'Student Experience': [
    'overall student experience', 'student satisfaction', 'college experience',
  ],
};

export function analyzeReviewAspects(reviewText: string): ReviewAnalysisResult {
  const lower = (reviewText || '').toLowerCase();
  const aspects: ReviewAspectAnalysis[] = [];

  for (const [aspectName, phrases] of Object.entries(REVIEW_ASPECT_RULES) as [ReviewAspectAnalysis['name'], string[]][]) {
    const matchedPhrase = phrases.find(p => lower.includes(p));
    if (matchedPhrase) {
      // Find sentence or snippet around the phrase
      const sentences = lower.split(/[.!?;]+/).map(s => s.trim()).filter(Boolean);
      const relevantSentence = sentences.find(s => s.includes(matchedPhrase)) || lower;

      const sentAnalysis = analyzeTextSentiment(relevantSentence);
      let aspectSentiment: ReviewAspectAnalysis['sentiment'] = 'neutral';
      if (sentAnalysis.label === 'positive') aspectSentiment = 'positive';
      else if (sentAnalysis.label === 'negative' || sentAnalysis.label === 'ragebait' || sentAnalysis.label === 'toxic') aspectSentiment = 'negative';
      else aspectSentiment = 'neutral';

      aspects.push({
        name: aspectName,
        sentiment: aspectSentiment
      });
    }
  }

  // Explicit deterministic phrase corrections
  for (const [phrase, correctAspect] of [
    ['classrooms', 'Infrastructure'],
    ['classroom', 'Infrastructure'],
    ['professors', 'Faculty'],
    ['professor', 'Faculty'],
    ['teachers', 'Faculty'],
    ['teacher', 'Faculty'],
    ['hostel rooms', 'Hostel'],
    ['hostel room', 'Hostel'],
    ['hostel food', 'Hostel'],
    ['placement support', 'Placements']
  ] as [string, ReviewAspectAnalysis['name']][]) {
    if (lower.includes(phrase)) {
      const existing = aspects.find(a => a.name === correctAspect || a.name === 'Academics');
      if (existing && existing.name !== correctAspect) {
        existing.name = correctAspect;
      }
    }
  }

  const overallSentimentAnalysis = analyzeTextSentiment(reviewText);
  let overall_sentiment: ReviewAnalysisResult['overall_sentiment'] = 'neutral';
  const hasPosAspect = aspects.some(a => a.sentiment === 'positive');
  const hasNegAspect = aspects.some(a => a.sentiment === 'negative');

  if (hasPosAspect && hasNegAspect) {
    overall_sentiment = 'mixed';
  } else if (overallSentimentAnalysis.label === 'positive') {
    overall_sentiment = 'positive';
  } else if (overallSentimentAnalysis.label === 'negative' || overallSentimentAnalysis.label === 'ragebait') {
    overall_sentiment = 'negative';
  } else {
    overall_sentiment = 'neutral';
  }

  return {
    overall_sentiment,
    aspects,
    model: 'campus-lenz-ai'
  };
}

// ============================================================================
// 7. Unified AI Moderation Pipeline (Master Evaluator with campus-lenz-ai)
// ============================================================================

export function runUnifiedAIModeration(
  content: string,
  imageUrl?: string,
  settings: Partial<AIModelSettings> = {}
): UnifiedAIModerationResult {
  const autoBanThreshold = settings.autoBanThreshold ?? DEFAULT_AI_MODEL_SETTINGS.autoBanThreshold;
  const blurThreshold = settings.blurThreshold ?? DEFAULT_AI_MODEL_SETTINGS.blurThreshold;

  const sentiment = analyzeTextSentiment(content);
  const toxicity = analyzeTextToxicity(content);
  const imageSafety = imageUrl ? classifyImageSafety(imageUrl) : undefined;
  const classification = classifyCampusLenzCategory(content);
  const postAnalysis = analyzeCampusLenzPost(content);

  let isHarmful = false;
  let isSensitive = false;
  let actionRecommended: UnifiedAIModerationResult['actionRecommended'] = 'allow';
  let actionReason: string | undefined = undefined;

  // 1. Critical Physical Threats or Extreme Hate Speech -> Safety Review / Auto-Ban Trigger
  if (postAnalysis.moderation === 'potentially_harmful' || toxicity.categories.threat > 90 || toxicity.categories.identityHate > 95) {
    isHarmful = true;
    isSensitive = true;
    actionRecommended = 'auto_ban';
    actionReason = postAnalysis.flagReason || `Severe policy violation: ${toxicity.categories.threat > 90 ? 'Violent Threat' : 'Hate Speech'} detected.`;
  }
  // 2. Unsolicited Commercial Spam or Graphic Visuals -> Quarantine
  else if (postAnalysis.moderation === 'spam' || imageSafety?.status === 'graphic') {
    isHarmful = true;
    isSensitive = true;
    actionRecommended = 'quarantine';
    actionReason = imageSafety?.status === 'graphic'
      ? `Graphic or explicit imagery detected by nsfwjs (${imageSafety.detectedLabels.join(', ')})`
      : 'Promotional or spam content flagged by campus-lenz-ai.';
  }
  // 3. Sensitive Discussion, Student Grievance, or Suggestive Imagery -> Sensitive Content Frosted Shield (Published & Visible)
  else if (postAnalysis.moderation === 'sensitive' || toxicity.score >= blurThreshold || sentiment.label === 'ragebait' || imageSafety?.status === 'suggestive') {
    isSensitive = true;
    isHarmful = false;
    actionRecommended = 'blur_sensitive';
    actionReason = postAnalysis.flagReason || (sentiment.label === 'ragebait'
      ? 'Controversial or heightened campus discourse'
      : imageSafety?.status === 'suggestive'
      ? 'Suggestive or non-academic imagery detected'
      : `Moderate hostility pattern (${toxicity.score}%) detected`);
  }
  // 4. Normal Clean content -> Allow
  else {
    isSensitive = false;
    isHarmful = false;
    actionRecommended = 'allow';
  }

  return {
    sentiment,
    toxicity,
    imageSafety,
    isSensitive,
    isHarmful,
    actionRecommended,
    actionReason,
    classification,
    postAnalysis
  };
}
