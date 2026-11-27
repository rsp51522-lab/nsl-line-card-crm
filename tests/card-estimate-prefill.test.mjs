import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { addCardEstimatePrefill, refreshCardClientUrls } from "../src/lib/card-estimate-prefill.ts";

const link = 'new URLSearchParams({ctype:card.company?.trim()?"法人":"個人",company:card.company?.trim()||"",name:card.name?.trim()||"",email:card.email?.trim()||""}),`https://rsp51522-lab.github.io/nextsaleslab-demo/?${params.toString()}`';

test("a business card's address and preferred phone reach the estimate form", () => {
  const patched = addCardEstimatePrefill(link);
  const card = { company: " 株式会社テスト ", name: " 担当者 ", email: " test@example.com ", address: " 栃木県栃木市本町 17-12 & 2階 ", mobile: " 090-1234-5678 ", phone: "0282-00-0000" };
  const params = vm.runInNewContext(patched.split('),`https:')[0] + ")", { URLSearchParams, card });
  const destination = new URL("https://example.com/?" + params.toString());
  for (const key of ["company", "name", "email", "address"]) assert.equal(destination.searchParams.get(key), card[key].trim());
  assert.equal(destination.searchParams.get("phone"), card.mobile.trim());
});

test("missing addresses remain blank and a landline is used without a mobile", () => {
  const patched = addCardEstimatePrefill(link);
  const params = vm.runInNewContext(patched.split('),`https:')[0] + ")", { URLSearchParams, card: { phone: "0282-00-0000" } });
  assert.equal(params.get("address"), "");
  assert.equal(params.get("phone"), "0282-00-0000");
});

test("patching is idempotent and leaves unrelated code and module IDs unchanged", () => {
  const source = "module38731;" + link + ";module81060";
  const patched = addCardEstimatePrefill(source);
  assert.equal(addCardEstimatePrefill(patched), patched);
  assert.ok(patched.startsWith("module38731;"));
  assert.ok(patched.endsWith(";module81060"));
  assert.equal(addCardEstimatePrefill('new URLSearchParams({email:card.email?.trim()||""})'), 'new URLSearchParams({email:card.email?.trim()||""})');
});

test("HTML and RSC navigation both bypass the old immutable client cache", () => {
  const path = "/_next/static/chunks/new-build-123.js";
  const html = `<script src="${path}?dpl=build"></script>`;
  assert.equal(refreshCardClientUrls(html), `<script src="${path}?nsl-prefill=20261127&dpl=build"></script>`);
  const rsc = JSON.stringify([path]);
  assert.equal(refreshCardClientUrls(rsc), JSON.stringify([path + "?nsl-prefill=20261127"]));
});
