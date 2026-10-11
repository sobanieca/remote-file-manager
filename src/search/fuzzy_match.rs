//! A compact port of the fzy scoring algorithm: every query character must
//! appear in order, and matches at path, word and camel case boundaries or
//! directly after another match score higher than scattered ones.
//!
//! Text is compared as UTF-16 code units, like JavaScript strings, so scores
//! and highlighted positions match what the browser indexes.

const SCORE_MIN: f64 = f64::NEG_INFINITY;
const SCORE_MAX: f64 = f64::INFINITY;
const SCORE_GAP_LEADING: f64 = -0.005;
const SCORE_GAP_TRAILING: f64 = -0.005;
const SCORE_GAP_INNER: f64 = -0.01;
const SCORE_MATCH_CONSECUTIVE: f64 = 1.0;
const SCORE_MATCH_SLASH: f64 = 0.9;
const SCORE_MATCH_WORD: f64 = 0.8;
const SCORE_MATCH_CAPITAL: f64 = 0.7;
const SCORE_MATCH_DOT: f64 = 0.6;

const MAX_QUERY_LENGTH: usize = 64;
const MAX_CANDIDATE_LENGTH: usize = 1024;
const MAX_TERMS: usize = 8;

pub struct Match {
    pub score: f64,
    pub positions: Vec<usize>,
}

/// A candidate prepared for matching.
pub struct Candidate {
    units: Vec<u16>,
    lower: Vec<u16>,
}

fn lower_unit(unit: u16) -> u16 {
    let Some(c) = char::from_u32(u32::from(unit)) else {
        return unit;
    };
    let mut lower = c.to_lowercase();
    match (lower.next(), lower.next()) {
        (Some(only), None) if only.len_utf16() == 1 => only as u16,
        _ => unit,
    }
}

impl Candidate {
    pub fn new(text: &str) -> Candidate {
        let units: Vec<u16> = text.encode_utf16().collect();
        let lower = units.iter().map(|&unit| lower_unit(unit)).collect();
        Candidate { units, lower }
    }
}

fn is_ascii(unit: u16, check: fn(&u8) -> bool) -> bool {
    u8::try_from(unit).is_ok_and(|byte| check(&byte))
}

fn compute_bonuses(candidate: &[u16]) -> Vec<f64> {
    let mut previous = u16::from(b'/');
    candidate
        .iter()
        .map(|&current| {
            let bonus = match u8::try_from(previous) {
                Ok(b'/') => SCORE_MATCH_SLASH,
                Ok(b'-' | b'_' | b' ') => SCORE_MATCH_WORD,
                Ok(b'.') => SCORE_MATCH_DOT,
                _ if is_ascii(previous, u8::is_ascii_lowercase)
                    && is_ascii(current, u8::is_ascii_uppercase) =>
                {
                    SCORE_MATCH_CAPITAL
                }
                _ => 0.0,
            };
            previous = current;
            bonus
        })
        .collect()
}

fn is_subsequence(query: &[u16], candidate: &[u16]) -> bool {
    let mut remaining = candidate.iter();
    query.iter().all(|c| remaining.any(|other| other == c))
}

fn score_with_positions(query: &[u16], candidate: &Candidate) -> Match {
    let query_length = query.len();
    let candidate_length = candidate.units.len();
    let bonuses = compute_bonuses(&candidate.units);

    let mut end_scores = vec![0.0; query_length * candidate_length];
    let mut best_scores = vec![0.0; query_length * candidate_length];

    for (i, &query_char) in query.iter().enumerate() {
        let row = i * candidate_length;
        let gap_score = if i == query_length - 1 {
            SCORE_GAP_TRAILING
        } else {
            SCORE_GAP_INNER
        };
        let mut previous_best = SCORE_MIN;
        for j in 0..candidate_length {
            if query_char == candidate.lower[j] {
                let score = if i == 0 {
                    j as f64 * SCORE_GAP_LEADING + bonuses[j]
                } else if j > 0 {
                    let previous_row = row - candidate_length;
                    (best_scores[previous_row + j - 1] + bonuses[j])
                        .max(end_scores[previous_row + j - 1] + SCORE_MATCH_CONSECUTIVE)
                } else {
                    SCORE_MIN
                };
                end_scores[row + j] = score;
                previous_best = score.max(previous_best + gap_score);
            } else {
                end_scores[row + j] = SCORE_MIN;
                previous_best += gap_score;
            }
            best_scores[row + j] = previous_best;
        }
    }

    let mut positions = vec![0; query_length];
    let mut match_required = false;
    let mut j = candidate_length as isize - 1;
    for i in (0..query_length).rev() {
        let row = i * candidate_length;
        while j >= 0 {
            let index = j as usize;
            let end_score = end_scores[row + index];
            if end_score != SCORE_MIN && (match_required || end_score == best_scores[row + index]) {
                match_required = i > 0
                    && index > 0
                    && best_scores[row + index]
                        == end_scores[row - candidate_length + index - 1] + SCORE_MATCH_CONSECUTIVE;
                positions[i] = index;
                j -= 1;
                break;
            }
            j -= 1;
        }
    }

    Match {
        score: best_scores[query_length * candidate_length - 1],
        positions,
    }
}

/// How well a single lower-cased term matches a candidate.
fn match_term(term: &[u16], candidate: &Candidate) -> Option<Match> {
    if term.is_empty() {
        return Some(Match {
            score: 0.0,
            positions: Vec::new(),
        });
    }
    if term.len() > MAX_QUERY_LENGTH
        || candidate.units.len() > MAX_CANDIDATE_LENGTH
        || term.len() > candidate.units.len()
    {
        return None;
    }
    if !is_subsequence(term, &candidate.lower) {
        return None;
    }
    if term.len() == candidate.units.len() {
        return Some(Match {
            score: SCORE_MAX,
            positions: (0..term.len()).collect(),
        });
    }
    Some(score_with_positions(term, candidate))
}

/// Splits a query into lower-cased terms, every one of which has to match.
pub fn parse_query(query: &str) -> Vec<Vec<u16>> {
    query
        .split_whitespace()
        .take(MAX_TERMS)
        .map(|term| term.encode_utf16().map(lower_unit).collect())
        .collect()
}

/// Scores a candidate against every term of a query.
pub fn match_query(terms: &[Vec<u16>], candidate: &Candidate) -> Option<Match> {
    let mut score = 0.0;
    let mut positions = Vec::new();
    for term in terms {
        let matched = match_term(term, candidate)?;
        score += matched.score;
        positions.extend(matched.positions);
    }
    positions.sort_unstable();
    positions.dedup();
    Some(Match { score, positions })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn matched(query: &str, candidate: &str) -> Option<Match> {
        match_query(&parse_query(query), &Candidate::new(candidate))
    }

    #[test]
    fn requires_characters_in_order() {
        assert!(matched("fexp", "src/endpoints/file-explorer.js").is_some());
        assert!(matched("pxef", "src/endpoints/file-explorer.js").is_none());
        assert!(matched("src main", "src/main.rs").is_some());
        assert!(matched("src nope", "src/main.rs").is_none());
    }

    #[test]
    fn prefers_boundaries_and_consecutive_matches() {
        let boundary = matched("fe", "src/file-explorer.js").unwrap();
        let scattered = matched("fe", "src/xfxxxxe.js").unwrap();
        assert!(boundary.score > scattered.score);
        assert_eq!(matched("main.rs", "main.rs").unwrap().score, f64::INFINITY);
    }

    #[test]
    fn reports_positions() {
        assert_eq!(matched("mr", "main.rs").unwrap().positions, [0, 5]);
        assert_eq!(matched("ab", "a/b").unwrap().positions, [0, 2]);
        assert_eq!(matched("é", "aé/é").unwrap().positions, [3]);
        assert_eq!(matched("x", "😀/x").unwrap().positions, [3]);
    }

    /// Reference output of the JavaScript implementation used before.
    #[test]
    fn computes_fzy_scores() {
        let cases: [(&str, &str, f64, &[usize]); 7] = [
            ("amor", "app/models/order", 3.595, &[0, 4, 11, 12]),
            ("fe", "src/file-explorer.js", 1.59, &[4, 9]),
            ("fe", "src/xfxxxxe.js", -0.08, &[5, 10]),
            ("mr", "main.rs", 1.455, &[0, 5]),
            ("é", "aé/é", 0.885, &[3]),
            ("x", "😀/x", 0.885, &[3]),
            ("src main", "src/main.rs", 6.725, &[0, 1, 2, 4, 5, 6, 7]),
        ];
        for (query, candidate, score, positions) in cases {
            let result = matched(query, candidate).unwrap();
            assert!((result.score - score).abs() < 1e-9, "{query} {candidate}");
            assert_eq!(result.positions, positions, "{query} {candidate}");
        }
    }
}
