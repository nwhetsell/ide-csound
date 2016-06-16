csound = require 'csound-api'
d3 = require 'd3'

class MessageHistoryElement extends HTMLElement
  initialize: (messageManager, @editor) ->
    messageManager.onDidReceiveMessage (message) => @handleMessage(message)
    messageManager.onGraphCreationRequest (request) => @handleGraphCreationRequest(request)
    messageManager.onGraphDrawingRequest (request) => @handleGraphDrawingRequest(request)

  getTitle: ->
    @editor.getTitle() + ' Csound output'

  handleGraphCreationRequest: ({name, data}) ->
    graphElement = document.createElement 'div'
    @divsForGraphIDs ?= {}
    @divsForGraphIDs[data.windid] = graphElement

    @handleGraphDrawingRequest data

    nextSibling = @nextSiblingsForGraphCaptions?[data.caption.trim()]
    if nextSibling
      @insertBefore graphElement, nextSibling
    else
      @appendChild graphElement
    @scrollTop += graphElement.clientHeight

  handleGraphDrawingRequest: (data) ->
    margin = {top: 20, right: 20, bottom: 30, left: 50}
    width = 650 - margin.left - margin.right
    height = 340 - margin.top - margin.bottom

    x = d3.scale.linear()
        .domain([0, data.fdata.length - 1])
        .range([0, width])

    y = d3.scale.linear()
        .domain([d3.min(data.fdata), d3.max(data.fdata)])
        .range([height, 0])

    xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')

    yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')

    line = d3.svg.line()
        .x((d) -> return x(d.index))
        .y((d) -> return y(d.value))

    svgElement = document.createElement 'svg'
    svg = d3.select(svgElement)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

    svg.append('path')
        .datum(data.fdata.map (value, index) -> {index: index, value: value})
        .attr('class', 'line')
        .attr('d', line)

    graphElement = @divsForGraphIDs?[data.windid]
    graphElement?.innerHTML = svgElement.outerHTML

  handleMessage: ({string, attributes}) ->
    if @lastChild?.localName isnt 'pre'
      @messageContainer = @appendChild document.createElement('pre')

    messageType = attributes & csound.MSG_TYPE_MASK
    if messageType is csound.MSG_DEFAULT
      span = @messageContainer.appendChild document.createElement('span')
      switch attributes & csound.MSG_FG_COLOR_MASK
        when csound.MSG_FG_BLACK
          span.classList.add 'csound-message-foreground-black'
        when csound.MSG_FG_RED
          span.classList.add 'csound-message-foreground-red'
        when csound.MSG_FG_GREEN
          span.classList.add 'csound-message-foreground-green'
        when csound.MSG_FG_YELLOW
          span.classList.add 'csound-message-foreground-yellow'
        when csound.MSG_FG_BLUE
          span.classList.add 'csound-message-foreground-blue'
        when csound.MSG_FG_MAGENTA
          span.classList.add 'csound-message-foreground-magenta'
        when csound.MSG_FG_CYAN
          span.classList.add 'csound-message-foreground-cyan'
        when csound.MSG_FG_WHITE
          span.classList.add 'csound-message-foreground-white'
      if attributes & csound.MSG_FG_BOLD
        span.classList.add 'highlight'
      if attributes & csound.MSG_FG_UNDERLINE
        span.classList.add 'csound-message-underline'
      switch attributes & csound.MSG_BG_COLOR_MASK
        when csound.MSG_BG_BLACK
          span.classList.add 'csound-message-background-black'
        when csound.MSG_BG_RED
          span.classList.add 'csound-message-background-red'
        when csound.MSG_BG_GREEN
          span.classList.add 'csound-message-background-green'
        when csound.MSG_BG_ORANGE
          span.classList.add 'csound-message-background-yellow'
        when csound.MSG_BG_BLUE
          span.classList.add 'csound-message-background-blue'
        when csound.MSG_BG_MAGENTA
          span.classList.add 'csound-message-background-magenta'
        when csound.MSG_BG_CYAN
          span.classList.add 'csound-message-background-cyan'
        when csound.MSG_BG_GREY
          span.classList.add 'csound-message-background-white'
    else
      className = 'highlight-'
      switch messageType
        when csound.MSG_ERROR
          className += 'error'
        when csound.MSG_ORCH or csound.MSG_REALTIME
          className += 'info'
        when csound.MSG_WARNING
          className += 'warning'
      span = @messageContainer.lastChild
      unless span?.classList.contains className
        span = @messageContainer.appendChild document.createElement('span')
        span.classList.add className
    span.appendChild document.createTextNode(string)

    @scrollTop = @scrollHeight - @clientHeight

    if /^ftable\s*\d+/.test string
      @messageContainer = @appendChild document.createElement('pre')
      @nextSiblingsForGraphCaptions ?= {}
      @nextSiblingsForGraphCaptions[string.trim()] = @messageContainer

module.exports = MessageHistoryElement = document.registerElement 'csound-message-history', prototype: MessageHistoryElement.prototype
