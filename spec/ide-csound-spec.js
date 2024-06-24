const IdeCsound = require("../lib/ide-csound");

describe("ide-csound", () => {
  let workspaceElement;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    waitsForPromise(() => atom.packages.activatePackage("ide-csound"));
  });

  it("is active", () => {
    expect(atom.packages.activePackages["ide-csound"]).toBeDefined();
  });
});
