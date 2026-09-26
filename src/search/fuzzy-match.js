// A compact port of the fzy scoring algorithm: every query character must
// appear in order, and matches at path, word and camel case boundaries or
// directly after another match score higher than scattered ones

const SCORE_MIN = -Infinity;
const SCORE_MAX = Infinity;
const SCORE_GAP_LEADING = -0.005;
const SCORE_GAP_TRAILING = -0.005;
const SCORE_GAP_INNER = -0.01;
const SCORE_MATCH_CONSECUTIVE = 1.0;
const SCORE_MATCH_SLASH = 0.9;
const SCORE_MATCH_WORD = 0.8;
const SCORE_MATCH_CAPITAL = 0.7;
const SCORE_MATCH_DOT = 0.6;

const MAX_QUERY_LENGTH = 64;
const MAX_CANDIDATE_LENGTH = 1024;

function isLowerCase(character) {
  return character >= "a" && character <= "z";
}

function isUpperCase(character) {
  return character >= "A" && character <= "Z";
}

function computeBonuses(candidate) {
  const bonuses = new Float64Array(candidate.length);
  let previous = "/";
  for (let index = 0; index < candidate.length; index++) {
    const current = candidate[index];
    if (previous === "/") {
      bonuses[index] = SCORE_MATCH_SLASH;
    } else if (previous === "-" || previous === "_" || previous === " ") {
      bonuses[index] = SCORE_MATCH_WORD;
    } else if (previous === ".") {
      bonuses[index] = SCORE_MATCH_DOT;
    } else if (isLowerCase(previous) && isUpperCase(current)) {
      bonuses[index] = SCORE_MATCH_CAPITAL;
    }
    previous = current;
  }
  return bonuses;
}

function isSubsequence(queryLower, candidateLower) {
  let candidateIndex = 0;
  for (const character of queryLower) {
    candidateIndex = candidateLower.indexOf(character, candidateIndex);
    if (candidateIndex === -1) {
      return false;
    }
    candidateIndex++;
  }
  return true;
}

function scoreWithPositions(queryLower, candidate, candidateLower) {
  const queryLength = queryLower.length;
  const candidateLength = candidate.length;
  const bonuses = computeBonuses(candidate);

  const endScores = new Float64Array(queryLength * candidateLength);
  const bestScores = new Float64Array(queryLength * candidateLength);

  for (let i = 0; i < queryLength; i++) {
    const rowOffset = i * candidateLength;
    const previousRowOffset = rowOffset - candidateLength;
    const gapScore = i === queryLength - 1
      ? SCORE_GAP_TRAILING
      : SCORE_GAP_INNER;
    let previousBestScore = SCORE_MIN;

    for (let j = 0; j < candidateLength; j++) {
      if (queryLower[i] === candidateLower[j]) {
        let score = SCORE_MIN;
        if (i === 0) {
          score = j * SCORE_GAP_LEADING + bonuses[j];
        } else if (j > 0) {
          score = Math.max(
            bestScores[previousRowOffset + j - 1] + bonuses[j],
            endScores[previousRowOffset + j - 1] + SCORE_MATCH_CONSECUTIVE,
          );
        }
        endScores[rowOffset + j] = score;
        previousBestScore = Math.max(score, previousBestScore + gapScore);
      } else {
        endScores[rowOffset + j] = SCORE_MIN;
        previousBestScore = previousBestScore + gapScore;
      }
      bestScores[rowOffset + j] = previousBestScore;
    }
  }

  const positions = new Array(queryLength);
  let matchRequired = false;
  let j = candidateLength - 1;
  for (let i = queryLength - 1; i >= 0; i--) {
    const rowOffset = i * candidateLength;
    for (; j >= 0; j--) {
      const endScore = endScores[rowOffset + j];
      if (
        endScore !== SCORE_MIN &&
        (matchRequired || endScore === bestScores[rowOffset + j])
      ) {
        matchRequired = i > 0 && j > 0 &&
          bestScores[rowOffset + j] ===
            endScores[rowOffset - candidateLength + j - 1] +
              SCORE_MATCH_CONSECUTIVE;
        positions[i] = j--;
        break;
      }
    }
  }

  return {
    score: bestScores[queryLength * candidateLength - 1],
    positions,
  };
}

/**
 * Scores how well a single term matches a candidate string
 * @param {string} term - The search term, already lower cased
 * @param {string} candidate - The candidate text
 * @param {string} candidateLower - The candidate text, lower cased
 * @returns {{score: number, positions: number[]}|null} - Null when unmatched
 */
export function matchTerm(term, candidate, candidateLower) {
  if (term.length === 0) {
    return { score: 0, positions: [] };
  }
  if (
    term.length > MAX_QUERY_LENGTH || candidate.length > MAX_CANDIDATE_LENGTH ||
    term.length > candidate.length
  ) {
    return null;
  }
  if (!isSubsequence(term, candidateLower)) {
    return null;
  }
  if (term.length === candidate.length) {
    return {
      score: SCORE_MAX,
      positions: Array.from({ length: term.length }, (_unused, index) => index),
    };
  }
  return scoreWithPositions(term, candidate, candidateLower);
}

/**
 * Splits a query into lower cased terms, every one of which has to match
 * @param {string} query - The raw search query
 * @returns {string[]} - The terms
 */
export function parseQuery(query) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .slice(0, 8);
}

/**
 * Scores a candidate against every term of a query
 * @param {string[]} terms - The terms from parseQuery
 * @param {string} candidate - The candidate text
 * @param {string} candidateLower - The candidate text, lower cased
 * @returns {{score: number, positions: number[]}|null} - Null when unmatched
 */
export function matchQuery(terms, candidate, candidateLower) {
  let score = 0;
  const positions = new Set();
  for (const term of terms) {
    const match = matchTerm(term, candidate, candidateLower);
    if (!match) {
      return null;
    }
    score += match.score;
    for (const position of match.positions) {
      positions.add(position);
    }
  }
  return { score, positions: [...positions].sort((a, b) => a - b) };
}
