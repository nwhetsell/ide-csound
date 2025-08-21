describe("ide-csound", () => {
  beforeEach(async () => {
    await atom.packages.activate("ide-csound");
  });

  it("is active", () => {
    expect(atom.packages.getActivePackage("ide-csound")).toBeDefined();
  });
});
