{CompositeDisposable} = require 'atom'
csound = require 'csound-api'
fs = require 'fs-plus'
path = require 'path'
MessageHistory = require './message-history'
MessageHistoryElement = require './message-history-element'
MessageManager = require './message-manager'

module.exports =
Csound =
  config:
    SFDIR:
      title: 'Default directory for saving sound files'
      type: 'string'
      description: 'Csound’s SFDIR environment variable'
      default: '~/Documents'

  Csound: null

  messageManager: null

  subscriptions: null

  activate: (state) ->
    csound.SetGlobalEnv 'SFDIR', fs.normalize atom.config.get 'ide-csound.SFDIR'
    @Csound = csound.Create()
    @messageManager = new MessageManager csound, @Csound

    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-workspace', 'ide-csound:run': => @run()

    atom.views.addViewProvider MessageHistory, (messageHistory) ->
      element = new MessageHistoryElement
      element.initialize messageHistory
      element

  deactivate: ->
    @subscriptions.dispose()

  run: ->
    previousActivePane = atom.workspace.getActivePane()
    editor = atom.workspace.getActiveTextEditor()
    atom.workspace.getActivePane().splitDown {items: [new MessageHistory @messageManager, editor]}
    previousActivePane.activate()
    switch editor.getGrammar().name
      when 'Csound Document'
        editor.save()
        # The Csound API function csoundCompileCsd can call csoundCompile,
        # which calls csoundStart
        # (https://github.com/csound/csound/blob/develop/Top/main.c#L494). The
        # API function csoundCompileCsdText added in commit 6770316
        # (https://github.com/csound/csound/commit/6770316cd9fd6e9c55f9730910a0a6c09a671c20)
        # calls csoundCompileCsd with the path of a temporary CSD file. The API
        # function csoundCompileArgs seems to be the only way to compile a CSD
        # file without also starting Csound.
        result = csound.CompileArgs @Csound, ['csound', editor.getPath()]
      else
        result = csound.CompileOrc @Csound, editor.getText()
    return if result isnt csound.CSOUND_SUCCESS
    result = csound.Start @Csound
    if result is csound.CSOUND_SUCCESS
      csound.PerformAsync @Csound, (result) =>
        csound.Reset @Csound
    else
      csound.Reset @Csound
