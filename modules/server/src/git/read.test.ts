import { expect } from "../test-utils";

import { getFile } from "./read";

describe("git read endpoint", () => {
  it("should throw if given an invalid request", async () => {
    await expect(getFile()).to.eventually.be.rejectedWith(/invalid/i);
    await expect(getFile("ref")).to.eventually.be.rejectedWith(/invalid/i);
  });

  it("should return the content at a valid filepath", async () => {
    await expect(getFile("main", "index.json")).to.eventually.be.ok;
  });
});



