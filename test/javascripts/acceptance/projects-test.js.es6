import { acceptance } from "helpers/qunit-helpers";

acceptance("Projects", { loggedIn: true });

test("Projects works", async assert => {
  await visit("/admin/plugins/projects");

  assert.ok(false, "it shows the Projects button");
});
