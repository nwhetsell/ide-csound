const csound = require("csound-api");
const d3 = require("d3");

class MessageHistoryElement extends HTMLElement {
  initialize(messageManager, editor) {
    messageManager.onDidReceiveMessage(message => this.handleMessage(message));
    messageManager.onGraphCreationRequest(request => this.handleGraphCreationRequest(request));
    messageManager.onGraphDrawingRequest(request => this.handleGraphDrawingRequest(request));

    this.editor = editor;
  }

  getTitle() {
    return `${this.editor.getTitle()} Csound output`;
  }

  handleGraphCreationRequest({name, data}) {
    const graphElement = document.createElement("div");
    if (!this.divsForGraphIDs)
      this.divsForGraphIDs = {};
    this.divsForGraphIDs[data.windid] = graphElement;

    this.handleGraphDrawingRequest(data);

    if (this.nextSiblingsForGraphCaptions) {
      const nextSibling = this.nextSiblingsForGraphCaptions[data.caption.trim()];
      if (nextSibling)
        this.insertBefore(graphElement, nextSibling);
      else
        this.appendChild(graphElement);
    }
    this.scrollTop += graphElement.clientHeight;
  }

  handleGraphDrawingRequest(data) {
    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = 650 - margin.left - margin.right;
    const height = 340 - margin.top - margin.bottom;

    const x = d3.scale.linear()
        .domain([0, data.fdata.length - 1])
        .range([0, width]);

    const y = d3.scale.linear()
        .domain([d3.min(data.fdata), d3.max(data.fdata)])
        .range([height, 0]);

    const xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    const yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    const line = d3.svg.line()
        .x(d => x(d.index))
        .y(d => y(d.value));

    const svgElement = document.createElement("svg");
    const svg = d3.select(svgElement)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("path")
        .datum(data.fdata.map((value, index) => { return {index: index, value: value}; }))
        .attr("class", "line")
        .attr("d", line);

    if (this.divsForGraphIDs) {
      const graphElement = this.divsForGraphIDs[data.windid];
      if (graphElement)
        graphElement.innerHTML = svgElement.outerHTML;
    }
  }

  handleMessage({string, attributes}) {
    if (!(this.lastChild && this.lastChild.localName === "pre"))
      this.messageContainer = this.appendChild(document.createElement("pre"));

    let span;
    const messageType = attributes & csound.MSG_TYPE_MASK;
    if (messageType === csound.MSG_DEFAULT){
      span = this.messageContainer.appendChild(document.createElement("span"));
      switch (attributes & csound.MSG_FG_COLOR_MASK) {
        case csound.MSG_FG_BLACK:
          span.classList.add("csound-message-foreground-black");
          break;
        case csound.MSG_FG_RED:
          span.classList.add("csound-message-foreground-red");
          break;
        case csound.MSG_FG_GREEN:
          span.classList.add("csound-message-foreground-green");
          break;
        case csound.MSG_FG_YELLOW:
          span.classList.add("csound-message-foreground-yellow");
          break;
        case csound.MSG_FG_BLUE:
          span.classList.add("csound-message-foreground-blue");
          break;
        case csound.MSG_FG_MAGENTA:
          span.classList.add("csound-message-foreground-magenta");
          break;
        case csound.MSG_FG_CYAN:
          span.classList.add("csound-message-foreground-cyan");
          break;
        case csound.MSG_FG_WHITE:
          span.classList.add("csound-message-foreground-white");
          break;
      }
      if (attributes & csound.MSG_FG_BOLD)
        span.classList.add("highlight");
      if (attributes & csound.MSG_FG_UNDERLINE)
        span.classList.add("csound-message-underline");
      switch (attributes & csound.MSG_BG_COLOR_MASK) {
        case csound.MSG_BG_BLACK:
          span.classList.add("csound-message-background-black");
          break;
        case csound.MSG_BG_RED:
          span.classList.add("csound-message-background-red");
          break;
        case csound.MSG_BG_GREEN:
          span.classList.add("csound-message-background-green");
          break;
        case csound.MSG_BG_ORANGE:
          span.classList.add("csound-message-background-yellow");
          break;
        case csound.MSG_BG_BLUE:
          span.classList.add("csound-message-background-blue");
          break;
        case csound.MSG_BG_MAGENTA:
          span.classList.add("csound-message-background-magenta");
          break;
        case csound.MSG_BG_CYAN:
          span.classList.add("csound-message-background-cyan");
          break;
        case csound.MSG_BG_GREY:
          span.classList.add("csound-message-background-white");
          break;
      }
    } else {
      let className = "highlight-";
      switch (messageType) {
        case csound.MSG_ERROR:
          className += "error";
          break;
        case csound.MSG_ORCH:
        case csound.MSG_REALTIME:
          className += "info";
          break;
        case csound.MSG_WARNING:
          className += "warning";
          break;
      }
      span = this.messageContainer.lastChild;
      if (!(span && span.classList.contains(className))) {
        span = this.messageContainer.appendChild(document.createElement("span"));
        span.classList.add(className);
      }
    }
    span.appendChild(document.createTextNode(string));

    this.scrollTop = this.scrollHeight - this.clientHeight;

    if (/^ftable\s*\d+/.test(string)) {
      this.messageContainer = this.appendChild(document.createElement("pre"));
      if (!this.nextSiblingsForGraphCaptions)
        this.nextSiblingsForGraphCaptions = {};
      this.nextSiblingsForGraphCaptions[string.trim()] = this.messageContainer;
    }
  }
}

customElements.define("csound-message-history", MessageHistoryElement);

module.exports = MessageHistoryElement;
