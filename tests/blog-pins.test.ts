import assert from "node:assert/strict";
import test from "node:test";
import { MAX_PINNED_POSTS, orderPostsWithPins, parsePinnedIds } from "../lib/blog-pins";

test("parsePinnedIds keeps unique string ids, max 3, and tolerates bad values", () => {
  assert.deepEqual(parsePinnedIds(null), []);
  assert.deepEqual(parsePinnedIds("not json"), []);
  assert.deepEqual(parsePinnedIds('{"a":1}'), []);
  assert.deepEqual(parsePinnedIds('[" a ", "b", "a", 3, "", "c", "d"]'), ["a", "b", "c"]);
  assert.equal(MAX_PINNED_POSTS, 3);
});

test("orderPostsWithPins puts pinned posts first in pin order and keeps the rest by date order", () => {
  const posts = [{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }];
  const ordered = orderPostsWithPins(posts, ["p3", "missing", "p1"]);
  assert.deepEqual(ordered.map((p) => p.id), ["p3", "p1", "p2", "p4"]);
  assert.deepEqual(ordered.map((p) => p.pinned), [true, true, false, false]);
});

test("orderPostsWithPins without pins leaves order unchanged", () => {
  const posts = [{ id: "x" }, { id: "y" }];
  assert.deepEqual(orderPostsWithPins(posts, []).map((p) => p.id), ["x", "y"]);
});
