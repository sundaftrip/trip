import assert from "node:assert/strict";
import test from "node:test";
import {
  appendCampaignToPath,
  campaignParamsFromSearch,
} from "../lib/campaign-attribution";

test("keeps UTM attribution while excluding unrelated query values", () => {
  assert.equal(
    campaignParamsFromSearch("?room=twin&utm_source=instagram&utm_campaign=aurora").toString(),
    "utm_source=instagram&utm_campaign=aurora",
  );
  assert.equal(
    appendCampaignToPath(
      "/tours/russia-aurora#harga",
      "?utm_medium=social&utm_source=ig&destination=rusia",
    ),
    "/tours/russia-aurora?utm_medium=social&utm_source=ig#harga",
  );
});
