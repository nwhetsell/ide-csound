csound = require 'csound-api'

class MessageHistoryElement extends HTMLElement
  createdCallback: ->
    @console = @appendChild @ownerDocument.createElement 'pre'

  initialize: (messageHistory) ->
    messageHistory.onDidReceiveMessage ({string, attributes}) =>
      messageType = attributes & csound.CSOUNDMSG_TYPE_MASK
      if messageType is csound.CSOUNDMSG_DEFAULT
        span = @console.appendChild @ownerDocument.createElement 'span'
        switch attributes & csound.CSOUNDMSG_FG_COLOR_MASK
          when csound.CSOUNDMSG_FG_BLACK
            span.classList.add 'csound-message-foreground-black'
          when csound.CSOUNDMSG_FG_RED
            span.classList.add 'csound-message-foreground-red'
          when csound.CSOUNDMSG_FG_GREEN
            span.classList.add 'csound-message-foreground-green'
          when csound.CSOUNDMSG_FG_YELLOW
            span.classList.add 'csound-message-foreground-yellow'
          when csound.CSOUNDMSG_FG_BLUE
            span.classList.add 'csound-message-foreground-blue'
          when csound.CSOUNDMSG_FG_MAGENTA
            span.classList.add 'csound-message-foreground-magenta'
          when csound.CSOUNDMSG_FG_CYAN
            span.classList.add 'csound-message-foreground-cyan'
          when csound.CSOUNDMSG_FG_WHITE
            span.classList.add 'csound-message-foreground-white'
        if attributes & csound.CSOUNDMSG_FG_BOLD
          span.classList.add 'highlight'
        if attributes & csound.CSOUNDMSG_FG_UNDERLINE
          span.classList.add 'csound-message-underline'
        switch attributes & csound.CSOUNDMSG_BG_COLOR_MASK
          when csound.CSOUNDMSG_BG_BLACK
            span.classList.add 'csound-message-background-black'
          when csound.CSOUNDMSG_BG_RED
            span.classList.add 'csound-message-background-red'
          when csound.CSOUNDMSG_BG_GREEN
            span.classList.add 'csound-message-background-green'
          when csound.CSOUNDMSG_BG_ORANGE
            span.classList.add 'csound-message-background-yellow'
          when csound.CSOUNDMSG_BG_BLUE
            span.classList.add 'csound-message-background-blue'
          when csound.CSOUNDMSG_BG_MAGENTA
            span.classList.add 'csound-message-background-magenta'
          when csound.CSOUNDMSG_BG_CYAN
            span.classList.add 'csound-message-background-cyan'
          when csound.CSOUNDMSG_BG_GREY
            span.classList.add 'csound-message-background-white'
      else
        className= 'highlight-'
        switch messageType
          when csound.CSOUNDMSG_ERROR
            className += 'error'
          when csound.CSOUNDMSG_ORCH or csound.CSOUNDMSG_REALTIME
            className += 'info'
          when csound.CSOUNDMSG_WARNING
            className += 'warning'
        span = @console.lastChild
        unless span?.classList.contains className
          span = @console.appendChild @ownerDocument.createElement 'span'
          span.classList.add className
      span.appendChild @ownerDocument.createTextNode string

module.exports = MessageHistoryElement = document.registerElement 'csound-message-history', prototype: MessageHistoryElement.prototype
