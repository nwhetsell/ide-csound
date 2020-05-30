const IdeCsound = require("../lib/ide-csound");

describe("ide-csound", () => {
  let workspaceElement;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    waitsForPromise(() => atom.packages.activatePackage("ide-csound"));
  });

  describe("when the ide-csound:run event is triggered", () => {
    it("shows the message history", () => {
      expect(workspaceElement.querySelector("csound-message-history")).not.toExist();
      waitsForPromise(() => atom.workspace.open().then(editor => {
        atom.commands.dispatch(workspaceElement, "ide-csound:run");
        const messageHistoryElement = workspaceElement.querySelector("csound-message-history");
        expect(messageHistoryElement).toExist();
      }));
    });
  });
});
