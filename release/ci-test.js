#!/usr/bin/env node

// compile typescript code and run unit tests

const $ = require("./common");

async function main() {
  process.env.NODE_ENV = "test";
  await $.showVersions(["npm"]);

  $(await $.npm("install"));

  $(await $.npm("run ts-check"));

  if (process.platform === "linux") {
    $(await $.sh('xvfb-run -a -s "-screen 0 1280x720x24" npm test -- --thorough'));
    $(await $.sh('xvfb-run -a -s "-screen 0 1280x720x24" npm run integration-tests'));
    $(await $.npm("run upload-coverage"));
  } else {
    $(await $.npm("test -- --thorough"));
    $(await $.npm("run integration-tests"));
  }
}

main();
