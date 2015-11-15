{Emitter} = require 'atom'

module.exports =
class MessageHistory
  constructor: (messageManager, @editor) ->
    @emitter = new Emitter
    messageManager.onDidReceiveMessage ({string, attributes}) =>
      @emitter.emit 'did-receive-message', {string, attributes}

  getTitle: ->
    @editor.getTitle() + ' Csound output'

  onDidReceiveMessage: (callback) ->
    @emitter.on 'did-receive-message', callback
