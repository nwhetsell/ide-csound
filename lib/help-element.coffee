cheerio = require 'cheerio'

class HelpElement extends HTMLElement
  getTitle: ->
    @opcodeName

  showHelpForOpcode: (data, @opcodeName) ->
    $ = cheerio.load data
    refentry = $ '.refentry'

    $('br', refentry).remove()
    for string in ['Note', 'Warning']
      $('img[alt="[' + string + ']"]', refentry).remove()
      string = string.toLowerCase()
      $('.' + string, refentry).removeAttr('style')
      $('.' + string + ' td[rowspan="2"]', refentry).remove()
    lastRefsect1 = $('.refsect1', refentry).last()
    if $('h2', lastRefsect1).text() is 'Credits'
      lastRefsect1.remove()

    refnamedivChildren = $('.refnamediv', refentry).children()
    child = refnamedivChildren.first()
    if child.text().trim() is @opcodeName
      nextSibling = child.next()
      nextSibling.text(nextSibling.text().replace new RegExp(@opcodeName + '\\s*—\\s*'), '')
      child.before '<h1>' + @opcodeName + '</h1>'
      child.remove()

    $('.example', refentry).removeAttr('class')

    @innerHTML = refentry.html()

    # Replacing pre elements with Atom editors this way is based on the
    # markdown-preview package (https://github.com/atom/markdown-preview).
    for preElement in @querySelectorAll('pre.programlisting')
      editorElement = document.createElement('atom-text-editor')
      editorElement.setAttributeNode document.createAttribute 'gutter-hidden'
      preElement.parentNode.insertBefore editorElement, preElement
      preElement.remove()
      editor = editorElement.getModel()
      editor.setText preElement.textContent.trim()
      editor.setGrammar atom.grammars.grammarForScopeName 'source.csound-document'

module.exports = HelpElement = document.registerElement 'csound-help', prototype: HelpElement.prototype
