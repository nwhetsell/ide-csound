const {Emitter} = require("atom");

module.exports =
class MessageManager {
  constructor(csound, Csound) {
    this.emitter = new Emitter();

    const messageCallback = (attributes, string) =>
      this.emitter.emit("did-receive-message", {string: string, attributes: attributes});
    csound.SetDefaultMessageCallback(messageCallback);
    csound.SetMessageCallback(Csound, messageCallback);

    csound.SetIsGraphable(Csound, true);
    csound.SetMakeGraphCallback(Csound, (data, name) =>
      this.emitter.emit("graph-creation-request", {name: name, data: data}));
    csound.SetDrawGraphCallback(Csound, data =>
      this.emitter.emit("graph-drawing-request", data));
  }

  onDidReceiveMessage(callback) {
    this.emitter.on("did-receive-message", callback);
  }

  onGraphCreationRequest(callback) {
    this.emitter.on("graph-creation-request", callback);
  }

  onGraphDrawingRequest(callback) {
    this.emitter.on("graph-drawing-request", callback);
  }
};
