import assert from "node:assert/strict";
import test from "node:test";
import { getMetadataTitleAlias } from "../lib/metadata-title-aliases";

const blog = {
  id: "cmtxci1h10000habtreaeovl8",
  title: "Mengenal Budaya Rusia: Dari Metro Moskow ke Kanal Saint Petersburg",
};

test("a reviewed article gets concise metadata without changing its editorial title", () => {
  const original = { ...blog };
  assert.equal(
    getMetadataTitleAlias(`blog:${blog.id}`, blog.title),
    "Budaya Rusia: Metro Moskow & Kanal Saint Petersburg",
  );
  assert.deepEqual(blog, original);
});

test("a future CMS title supersedes the reviewed metadata alias", () => {
  const revisedTitle = "Budaya Rusia: Panduan Metro Moskow Terbaru";
  assert.equal(getMetadataTitleAlias(`blog:${blog.id}`, revisedTitle), undefined);
  assert.equal(getMetadataTitleAlias(`blog:${blog.id}`, revisedTitle) ?? revisedTitle, revisedTitle);
});

test("an unrelated document with the same title does not inherit an alias", () => {
  assert.equal(getMetadataTitleAlias("blog:new-document", blog.title), undefined);
  assert.equal(getMetadataTitleAlias(`tour:${blog.id}`, blog.title), undefined);
});

test("tour metadata retains duration and cruise distinction with an exact source guard", () => {
  const key = "tour:cmqe4a4p50003e0z0vwjkpod0";
  const title = "4 Hari 3 Malam Vietnam Utara dengan Pelayaran Harian Teluk Halong";
  assert.equal(
    getMetadataTitleAlias(key, title),
    "Vietnam Utara 4H3M: Pelayaran Harian Teluk Halong",
  );
  assert.equal(getMetadataTitleAlias(key, title.replace("4 Hari", "5 Hari")), undefined);
});

test("destination aliases preserve a future custom CMS metadata title", () => {
  const key = "/destinations/murmansk";
  assert.equal(
    getMetadataTitleAlias(key, "Wisata Murmansk & Aurora Borealis dari Indonesia, Sundaftrip"),
    "Wisata Murmansk & Aurora Borealis dari Indonesia",
  );
  assert.equal(getMetadataTitleAlias(key, "Murmansk: Panduan Musim Panas"), undefined);
});

test("unreviewed titles are never shortened merely because they are long", () => {
  const title = "Panduan perjalanan khusus yang memerlukan judul panjang untuk menjaga informasi destinasi dan jadwal";
  assert.equal(getMetadataTitleAlias("/unreviewed-page", title), undefined);
  assert.equal(getMetadataTitleAlias("/russia/catering", title), undefined);
});
