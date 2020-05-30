const {CompositeDisposable} = require("atom");
const csound = require("csound-api");
const fs = require("fs-plus");
const path = require("path");
const HelpElement = require("./help-element");
const MessageHistoryElement = require("./message-history-element");
const MessageManager = require("./message-manager");

module.exports = {
  config: {
    CSDOCDIR: {
      title: "Directory containing Csound’s manual as HTML",
      type: "string",
      description: "Csound’s `CSDOCDIR` environment variable",
      default: ""
    },
    SADIR: {
      title: "Default directory for saving analysis files",
      type: "string",
      description: "Csound’s `SADIR` environment variable",
      default: "~/Documents"
    },
    SFDIR: {
      title: "Default directory for saving sound files",
      type: "string",
      description: "Csound’s `SFDIR` environment variable",
      default: "~/Documents"
    },
    SSDIR: {
      title: "Default directory for loading sound and MIDI files",
      type: "string",
      description: "Csound’s `SSDIR` environment variable",
      default: "~/Documents"
    }
  },

  activate(state) {
    csound.SetGlobalEnv("SFDIR", fs.normalize(atom.config.get("ide-csound.SFDIR")));
    this.Csound = csound.Create();
    this.messageManager = new MessageManager(csound, this.Csound);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add("atom-workspace", {"ide-csound:run": () => this.run()}));
    this.subscriptions.add(atom.commands.add("atom-workspace", {"ide-csound:stop": () => this.stop()}));
    this.subscriptions.add(atom.commands.add("atom-workspace", {"ide-csound:show-help-for-selected-opcode": () => this.showHelpForSelectedOpcode()}));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  run() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor)
      return;

    const previousActivePane = atom.workspace.getActivePane();
    const messageHistoryElement = new MessageHistoryElement();
    messageHistoryElement.initialize(this.messageManager, editor);
    atom.workspace.getActivePane().splitDown({items: [messageHistoryElement]});
    previousActivePane.activate();

    function perform(Csound, result) {
      if (result !== csound.SUCCESS) {
        csound.Reset(Csound);
        return;
      }
      result = csound.Start(Csound);
      if (result === csound.SUCCESS)
        csound.PerformAsync(Csound, () => csound.Reset(Csound));
      else
        csound.Reset(Csound);
    }

    switch (editor.getGrammar().name) {
      case "Csound Document":
        const disposable = editor.onDidSave(() => {
          // The Csound API function csoundCompileCsd can call csoundCompile,
          // which calls csoundStart
          // (https://github.com/csound/csound/blob/develop/Top/main.c#L494).
          // The API function csoundCompileCsdText added in commit 6770316
          // (https://github.com/csound/csound/commit/6770316cd9fd6e9c55f9730910a0a6c09a671c20)
          // calls csoundCompileCsd with the path of a temporary CSD file. The
          // API function csoundCompileArgs seems to be the only way to compile
          // a CSD file without also starting Csound.
          perform(this.Csound, csound.CompileArgs(this.Csound, ["csound", editor.getPath()]));
          disposable.dispose();
        });
        editor.save();
        break;
      default:
        perform(this.Csound, csound.CompileOrc(this.Csound, editor.getText()));
    }
  },

  stop() {
    csound.Stop(this.Csound);
  },

  showHelpForOpcode(opcodeName) {
    const filename = (opcodeName === "0dbfs") ? "Zerodbfs" : opcodeName;
    fs.readFile(fs.normalize(path.join(atom.config.get("ide-csound.CSDOCDIR"), `${filename}.html`)), "utf8", (error, data) => {
      if (error)
        return;

      const helpElement = new HelpElement();
      helpElement.showHelpForOpcode(data, opcodeName);

      const eventHandler = event =>
        this.showHelpForOpcode(event.target.textContent);
      for (const aElement of helpElement.querySelectorAll("a.link")) {
        aElement.removeAttribute("title");
        aElement.addEventListener("click", eventHandler);
      }

      if (this.helpPane) {
        this.helpPane.addItem(helpElement);
        this.helpPane.activateItem(helpElement);
      } else {
        const previousActivePane = atom.workspace.getActivePane();
        this.helpPane = atom.workspace.getActivePane().splitRight({items: [helpElement]});
        this.subscriptions.add(this.helpPane.onDidDestroy(() => delete(this.helpPane)));
        previousActivePane.activate();
      }
    });
  },

  showHelpForSelectedOpcode() {
    const editor = atom.workspace.getActiveTextEditor();
    editor.selectWordsContainingCursors();
    this.showHelpForOpcode(editor.getSelectedText());
  }
};
