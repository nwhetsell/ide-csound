const cheerio = require("cheerio");

class HelpElement extends HTMLElement {
  getTitle() {
    return this.opcodeName;
  }

  showHelpForOpcode(data, opcodeName) {
    this.opcodeName = opcodeName;

    const $ = cheerio.load(data);
    const refentry = $(".refentry");

    $("br", refentry).remove();
    for (let string of ["Note", "Warning"]) {
      $(`img[alt="[${string}]"]`, refentry).remove();
      string = string.toLowerCase();
      $(`.${string}`, refentry).removeAttr("style");
      $(`.${string} td[rowspan="2"]`, refentry).remove();
    }
    const lastRefsect1 = $(".refsect1", refentry).last();
    if ($("h2", lastRefsect1).text() === "Credits")
      lastRefsect1.remove();

    const refnamedivChildren = $(".refnamediv", refentry).children();
    const child = refnamedivChildren.first();
    if (child.text().trim() === this.opcodeName) {
      const nextSibling = child.next();
      nextSibling.text(nextSibling.text().replace(new RegExp(`${this.opcodeName}\\s*—\\s*`), ""));
      child.before(`<h1>${this.opcodeName}</h1>`);
      child.remove();
    }

    $(".example", refentry).removeAttr("class");

    this.innerHTML = refentry.html();

    // Replacing pre elements with Atom editors this way is based on the
    // markdown-preview package (https://github.com/atom/markdown-preview).
    for (const preElement of this.querySelectorAll("pre.programlisting")) {
      const editorElement = document.createElement("atom-text-editor");
      editorElement.setAttributeNode(document.createAttribute("gutter-hidden"));
      preElement.parentNode.insertBefore(editorElement, preElement);
      preElement.remove();
      const editor = editorElement.getModel();
      editor.setText(preElement.textContent.trim());
      editor.setGrammar(atom.grammars.grammarForScopeName("source.csound-document"));
    }
  }
}

customElements.define("csound-help", HelpElement);

module.exports = HelpElement;
