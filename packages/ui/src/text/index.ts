/**
 * Word filtering for player-authored text: display names, chat messages,
 * nameplates, clan tags, and anything else a player types that another player
 * reads.
 *
 * Plain `includes()` against a word list fails immediately in a game: players
 * write `sh*t`, `sh1t`, `SHIIIT`, `a$$hole`, `a s s`, and `ｓｈｉｔ`, while
 * "Scunthorpe", "assassin", and "classic" are innocent. This module folds
 * those spellings back together before matching and exempts known-good words,
 * then reports where each match is so a game can mask it or reject the input.
 *
 * The words to match are yours: `words` is required and the package ships no
 * list. Which words a game filters depends on its audience, rating, and
 * languages, and maintained lists are published separately. What this module
 * provides is the matching, which is the part that is easy to get wrong.
 *
 * No DOM, no React, no engine: the same filter runs in a game client, a world
 * renderer, and an authoritative server. Filtering on the client is a display
 * courtesy, not enforcement — a modified client sends whatever it likes, so a
 * multiplayer game filters on the server too.
 *
 * ```ts
 * const filter = createTextFilter({ words: bannedWords });
 * filter.clean("what the shiiit");        // "what the ******"
 * filter.hasMatch("xXsh1tlordXx", { match: "loose" }); // true
 * ```
 */
import { defaultAllowList } from "./allow.ts";

export { defaultAllowList } from "./allow.ts";

/**
 * How a word in the list is allowed to sit inside the text.
 *
 * - `word` (default) matches from the start of a word, so endings are covered
 *   (`shitty`, `bitches`) while a listed word buried after other letters is
 *   not: "bypass", "Scunthorpe", and "assassin" stay clean without relying on
 *   the allow list. Use it for chat, where a false positive is worse than a
 *   missed word in a scrolling log. `clean` masks the whole word, not just the
 *   listed part.
 * - `loose` matches anywhere inside a word, catching `xXshitlordXx` and
 *   `ShitLord99`. Use it for display names and clan tags, where a player picks
 *   one permanent string and evasion is deliberate.
 */
export type TextMatchMode = "word" | "loose";

export interface TextFilterOptions {
  /**
   * The words to filter. Required: the package ships none, because which words
   * a game filters is its own decision. Write them plainly, one spelling each
   * — case, accents, spacing, repeated letters, and digit-for-letter
   * substitutions are handled by the matcher, so `shiiit` and `sh1t` need no
   * entries of their own.
   *
   * Throws if the list is empty, rather than quietly matching nothing.
   */
  words: Iterable<string>;
  /**
   * Words that must never be flagged, added to `defaultAllowList`. Allowed
   * words are matched loosely, so `analy` exempts "analyze" and "analysis".
   */
  allow?: Iterable<string>;
  /** Defaults to `word`. Override per call with the second argument. */
  match?: TextMatchMode;
  /**
   * Treat digits and symbols that stand in for letters (`4`, `@`, `1`, `$`) as
   * those letters. Defaults to true. Turning it off makes matching literal.
   */
  leet?: boolean;
  /**
   * Treat repeated letters as one, so `shiiit` matches `shit`. Defaults to
   * true. Doubled letters in a listed word are still required: an entry of
   * `boss` does not match `bos`.
   */
  collapseRepeats?: boolean;
  /** Character `clean` repeats over a match. Defaults to `*`. */
  mask?: string;
  /** Replaces the whole match instead of masking it character by character, such as `[removed]`. */
  placeholder?: string;
}

/** Where a listed word was found, in indices into the original string. */
export interface TextMatch {
  /** The list entry that matched, as written in the list. */
  readonly word: string;
  /** Start index in the original text. */
  readonly start: number;
  /** End index in the original text, exclusive. */
  readonly end: number;
  /** The matched text, exactly as the player wrote it. */
  readonly text: string;
}

export interface TextFilterCallOptions {
  /** Overrides the filter's `match` mode for this call. */
  match?: TextMatchMode;
}

export interface TextFilter {
  /** Every match, ordered by position and never overlapping. */
  matches(text: string, options?: TextFilterCallOptions): readonly TextMatch[];
  /** True when the text contains at least one listed word. Reject names with this. */
  hasMatch(text: string, options?: TextFilterCallOptions): boolean;
  /** The text with every match masked. Unmatched text, including spacing, is untouched. */
  clean(text: string, options?: TextFilterCallOptions): string;
}

/**
 * Symbols and digits players substitute for letters. A source character may
 * stand for more than one letter (`1` is both `i` and `l`), in which case any
 * of them may match.
 */
const leetCandidates: Readonly<Record<string, string>> = {
  "0": "o",
  "1": "il",
  "2": "z",
  "3": "e",
  "4": "a",
  "5": "s",
  "6": "g",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  $: "s",
  "!": "i",
  "|": "il",
  "+": "t",
};

/** One content character: the letters it may stand for, and where it came from. */
interface NormalizedChar {
  readonly chars: string;
  readonly index: number;
  /** True when nothing was dropped between this character and the one before it. */
  readonly adjacent: boolean;
}

const COMBINING_MARK = /\p{M}/gu;
const LETTER = /\p{L}/u;

/**
 * Folds accents, full-width forms, and case together, drops everything that is
 * not a letter, and keeps each surviving character's index in the original
 * string. Separators disappear entirely, which is what lets `a s s` and
 * `f-u-c-k` match; word boundaries are checked against the original text
 * instead, so dropping them cannot merge two real words into a match.
 */
function normalize(text: string, leet: boolean): NormalizedChar[] {
  const out: NormalizedChar[] = [];
  let index = 0;
  /** Where the last kept character ended, so dropped separators are visible here. */
  let keptEnd = 0;
  for (const source of text) {
    const folded = source.normalize("NFKD").replace(COMBINING_MARK, "").toLowerCase();
    for (const char of folded) {
      const chars = LETTER.test(char) ? char : leet ? leetCandidates[char] : undefined;
      if (chars === undefined) continue;
      out.push({ chars, index, adjacent: keptEnd >= index });
      keptEnd = index + source.length;
    }
    index += source.length;
  }
  return out;
}

/** A list entry reduced to the canonical letters the matcher compares against. */
function normalizeEntry(entry: string, leet: boolean): string {
  return normalize(entry, leet)
    .map(({ chars }) => chars[0]!)
    .join("");
}

/** True when the original text has no letter on this side of a match. */
function isBoundary(text: string, index: number): boolean {
  if (index < 0 || index >= text.length) return true;
  return !LETTER.test(text[index]!);
}

/** The end of the word a match runs into, so an ending is masked with it. */
function wordEnd(text: string, from: number): number {
  let end = from;
  while (end < text.length && LETTER.test(text[end]!)) end++;
  return end;
}

/**
 * Matches `entry` against the normalized text starting at `from`, returning the
 * index just past the match or -1. With `collapseRepeats`, a run of the same
 * letter counts once, except where the entry itself needs the repeat.
 */
function matchAt(
  chars: readonly NormalizedChar[],
  from: number,
  entry: string,
  collapseRepeats: boolean,
): number {
  let at = from;
  for (let i = 0; i < entry.length; i++) {
    const wanted = entry[i]!;
    if (at >= chars.length || !chars[at]!.chars.includes(wanted)) return -1;
    at++;
    if (collapseRepeats && entry[i + 1] !== wanted) {
      // Only a run written as a run: `shiiit` collapses, while `shit that`
      // must not swallow the `t` that starts the next word.
      while (at < chars.length && chars[at]!.adjacent && chars[at]!.chars.includes(wanted)) at++;
    }
  }
  return at;
}

interface Span {
  readonly word: string;
  readonly start: number;
  readonly end: number;
}

/**
 * Finds every non-overlapping match, preferring the longest one at each
 * position so `shithead` reports once rather than as `shit`.
 */
function scan(
  chars: readonly NormalizedChar[],
  text: string,
  index: ReadonlyMap<string, readonly (readonly [string, string])[]>,
  mode: TextMatchMode,
  collapseRepeats: boolean,
): Span[] {
  const spans: Span[] = [];
  for (let start = 0; start < chars.length;) {
    if (mode === "word" && !isBoundary(text, chars[start]!.index - 1)) {
      start++;
      continue;
    }
    let best: Span | undefined;
    for (const candidate of chars[start]!.chars) {
      for (const [entry, word] of index.get(candidate) ?? []) {
        const end = matchAt(chars, start, entry, collapseRepeats);
        if (end < 0) continue;
        if (!best || end > best.end) best = { word, start, end };
      }
    }
    if (!best) {
      start++;
      continue;
    }
    spans.push(best);
    start = best.end;
  }
  return spans;
}

/** Groups entries by the letter they start with, so a scan compares few of them. */
function buildIndex(
  entries: Iterable<string>,
  leet: boolean,
): Map<string, (readonly [string, string])[]> {
  const index = new Map<string, (readonly [string, string])[]>();
  for (const word of entries) {
    const entry = normalizeEntry(word, leet);
    if (entry.length === 0) continue;
    const first = entry[0]!;
    const bucket = index.get(first);
    if (bucket) bucket.push([entry, word]);
    else index.set(first, [[entry, word]]);
  }
  return index;
}

/**
 * Builds a filter from your word list. Compiling the lists costs more than
 * checking a string, so create one filter at startup and reuse it; never build
 * one per message, per render, or inside a game loop.
 */
export function createTextFilter(options: TextFilterOptions): TextFilter {
  const {
    words,
    allow = [],
    match: defaultMode = "word",
    leet = true,
    collapseRepeats = true,
    mask = "*",
    placeholder,
  } = options;

  const wordIndex = buildIndex(words, leet);
  if (wordIndex.size === 0) {
    throw new Error("createTextFilter: `words` is empty, so nothing would ever match.");
  }
  const allowIndex = buildIndex([...defaultAllowList, ...allow], leet);

  function findSpans(text: string, mode: TextMatchMode): Span[] {
    const chars = normalize(text, leet);
    if (chars.length === 0) return [];
    const found = scan(chars, text, wordIndex, mode, collapseRepeats);
    if (found.length === 0) return [];
    // Allowed words are matched loosely so "analy" covers "analysis" too, and
    // must contain the match rather than merely touch it: "bass" sits inside
    // "dumbass" without making "dumbass" innocent.
    const allowed = scan(chars, text, allowIndex, "loose", collapseRepeats);
    const kept = found.filter(
      (span) => !allowed.some((safe) => safe.start <= span.start && span.end <= safe.end),
    );
    return kept.map(({ word, start, end }) => ({
      word,
      start: chars[start]!.index,
      // Word mode matched from a word start, so mask the ending too: masking
      // `shitty` reads better than `shit` plus a stray `ty`.
      end: mode === "word" ? wordEnd(text, chars[end - 1]!.index + 1) : chars[end - 1]!.index + 1,
    }));
  }

  return {
    matches(text, callOptions) {
      return findSpans(text, callOptions?.match ?? defaultMode).map(({ word, start, end }) => ({
        word,
        start,
        end,
        text: text.slice(start, end),
      }));
    },
    hasMatch(text, callOptions) {
      return findSpans(text, callOptions?.match ?? defaultMode).length > 0;
    },
    clean(text, callOptions) {
      const spans = findSpans(text, callOptions?.match ?? defaultMode);
      if (spans.length === 0) return text;
      let result = "";
      let at = 0;
      for (const { start, end } of spans) {
        result += text.slice(at, start);
        result += placeholder ?? mask.repeat(end - start);
        at = end;
      }
      return result + text.slice(at);
    },
  };
}
