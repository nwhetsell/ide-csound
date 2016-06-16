{Emitter} = require 'atom'

module.exports =
class MessageManager
  constructor: (csound, Csound) ->
    @emitter = new Emitter

    messageCallback = (Csound, attributes, string) =>
      @emitter.emit 'did-receive-message', {string: string, attributes: attributes}
    csound.SetDefaultMessageCallback messageCallback
    csound.SetMessageCallback Csound, messageCallback

    csound.SetIsGraphable Csound, true
    csound.SetMakeGraphCallback Csound, (data, name) =>
      @emitter.emit 'graph-creation-request', {name: name, data: data}
    csound.SetDrawGraphCallback Csound, (data) =>
      @emitter.emit 'graph-drawing-request', data

  onDidReceiveMessage: (callback) ->
    @emitter.on 'did-receive-message', callback

  onGraphCreationRequest: (callback) ->
    @emitter.on 'graph-creation-request', callback

  onGraphDrawingRequest: (callback) ->
    @emitter.on 'graph-drawing-request', callback
