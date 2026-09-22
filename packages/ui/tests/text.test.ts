import { expect, test } from "vite-plus/test";
import { createTextFilter, defaultAllowList } from "../src/text/index.ts";

/** The package ships no word list, so tests bring their own. */
const words = ["shit", "shithead", "ass", "asshole", "dumbass", "bitch"];

const filter = createTextFilter({ words });
const names = createTextFilter({ words, match: "loose" });

test("masks a listed word and leaves the rest of the message alone", () => {
  expect(filter.clean("you shit at this game")).toBe("you **** at this game");
  expect(filter.clean("good game, well played")).toBe("good game, well played");
  expect(filter.hasMatch("good game")).toBe(false);
});

test.each([
  ["SHIT you", "**** you"],
  ["shiiiiit", "********"],
  ["sh1t", "****"],
  ["a$$", "***"],
  ["a-s-s", "*****"],
  ["ｓｈｉｔ", "****"],
  ["shït", "****"],
])("folds evasive spelling %s", (input, expected) => {
  expect(filter.clean(input)).toBe(expected);
});

test.each([
  ["shitty team", "****** team"],
  ["bitches everywhere", "******* everywhere"],
])("word mode masks the whole word, endings included: %s", (input, expected) => {
  expect(filter.clean(input)).toBe(expected);
});

test("word mode ignores a listed word that follows other letters", () => {
  expect(filter.hasMatch("dumbass")).toBe(true);
  for (const safe of ["bypass", "Grasshopper", "classic", "assassin", "harass"]) {
    expect(filter.hasMatch(safe), `${safe} must be clean`).toBe(false);
  }
});

test("a listed word does not swallow the word after it", () => {
  expect(filter.clean("shit that")).toBe("**** that");
});

test("loose mode masks only the letters it matched", () => {
  expect(names.clean("xXshitlordXx")).toBe("xX****lordXx");
});

test("word mode keeps whole words; loose mode reaches inside them", () => {
  expect(filter.hasMatch("xXshitlordXx")).toBe(false);
  expect(names.hasMatch("xXshitlordXx")).toBe(true);
  expect(filter.hasMatch("shitlord", { match: "loose" })).toBe(true);
  expect(names.hasMatch("shit lord", { match: "word" })).toBe(true);
});

test("reports each match with its position in the original text", () => {
  const [match, ...rest] = filter.matches("oh SHIT that");
  expect(rest).toHaveLength(0);
  expect(match).toEqual({ word: "shit", start: 3, end: 7, text: "SHIT" });
});

test("reports the longest word at a position, once", () => {
  expect(filter.matches("shithead").map((m) => m.word)).toEqual(["shithead"]);
  expect(filter.clean("shithead")).toBe("********");
});

test("collapsing repeats still requires doubled letters the word has", () => {
  const strict = createTextFilter({ words: ["boss"], match: "loose" });
  expect(strict.hasMatch("bos"), "a single s must not satisfy ss").toBe(false);
  expect(strict.hasMatch("booosss")).toBe(true);
});

test("masks with a placeholder when one is given", () => {
  const redacting = createTextFilter({ words, placeholder: "[removed]" });
  expect(redacting.clean("you shit")).toBe("you [removed]");
});

test("takes a custom mask character", () => {
  expect(createTextFilter({ words, mask: "#" }).clean("shit")).toBe("####");
});

test("the caller's list is the whole list", () => {
  const custom = createTextFilter({ words: ["noob"] });
  expect(custom.hasMatch("noob")).toBe(true);
  expect(custom.hasMatch("shit")).toBe(false);
});

test("rejects an empty word list rather than matching nothing", () => {
  expect(() => createTextFilter({ words: [] })).toThrow(/empty/);
  // Entries that normalize to nothing leave no list behind either.
  expect(() => createTextFilter({ words: ["***", "  "] })).toThrow(/empty/);
});

test("allow adds to the default allow list without replacing it", () => {
  const allowing = createTextFilter({ words: ["ass", "shart"], allow: ["sharted"] });
  expect(allowing.hasMatch("sharted"), "custom allow entry").toBe(false);
  expect(allowing.hasMatch("assassin"), "default allow entry still applies").toBe(false);
  expect(allowing.hasMatch("shart")).toBe(true);
});

test("literal matching when leet and repeat folding are off", () => {
  const literal = createTextFilter({ words, leet: false, collapseRepeats: false });
  expect(literal.hasMatch("sh1t")).toBe(false);
  expect(literal.hasMatch("shiiit")).toBe(false);
  expect(literal.hasMatch("shit")).toBe(true);
});

test("handles empty and punctuation-only text", () => {
  expect(filter.clean("")).toBe("");
  expect(filter.matches("!!! ...")).toEqual([]);
});

test("the shipped allow list is lowercase and free of duplicates", () => {
  expect(new Set(defaultAllowList).size).toBe(defaultAllowList.length);
  for (const word of defaultAllowList) expect(word).toBe(word.toLowerCase().trim());
});

test("no allowed word is flagged, even by the roots it protects", () => {
  // The roots defaultAllowList exists to keep from matching ordinary English.
  // Slurs appear here only because an allow list nothing tests is worthless.
  const roots = createTextFilter({
    match: "loose",
    words: [
      "anal",
      "anus",
      "ass",
      "cock",
      "coon",
      "cum",
      "cunt",
      "dick",
      "fag",
      "penis",
      "rape",
      "semen",
      "shit",
      "spic",
      "tit",
      "twat",
      "wank",
    ],
  });
  for (const word of defaultAllowList) {
    expect(roots.hasMatch(word), `${word} must stay allowed`).toBe(false);
  }
});

test("scales to a long message without pathological cost", () => {
  const message = `${"the quick brown fox jumps over the lazy dog. ".repeat(200)}shit`;
  const started = performance.now();
  expect(filter.hasMatch(message)).toBe(true);
  expect(performance.now() - started).toBeLessThan(100);
});
