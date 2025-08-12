describe("ide-csound", () => {
  beforeEach(() => {
    waitsForPromise(() => atom.packages.activatePackage("ide-csound"));
  });

  it("is active", () => {
    expect(atom.packages.activePackages["ide-csound"]).toBeDefined();
  });
});
