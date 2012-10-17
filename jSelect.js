(function($, Backbone, _) {

var _optionEmpty = function(option) {
  var $option = $(option)
  return !$option.val() && !$option.text()
}

var View = Backbone.View.extend({
  constructor: function(options) {
    _.bindAll(this)
    this.$target = options.$target
    this.$select = options.$select || options.$target
    Backbone.View.apply(this, arguments)
  }
})

var Option = View.extend({
  tagName: 'li',
  events: { 'click': '_select' },

  initialize: function() {
    if (this.isGroup()) {
      this.list = new Options({
        $select: this.$select,
        $target: this.$target
      })
      this.$el.addClass('group')
    }
    this.render()
  },

  render: function() {
    if (_optionEmpty(this.$target)) return this.remove()
    this.$el
      .html(this.text())
      .toggleClass('disabled', this.$target.prop('disabled'))
    this.list && this.$el.append(this.list.$el.addClass('open'))
    return this
  },

  text: function() {
    var text = this.isGroup() ? this.$target.attr('label') : this.$target.text()
    return $('<span/>').text(text)
  },

  isGroup: function() {
    return this.$target.is('optgroup')
  },

  _select: function() {
    if (this.isGroup()) return true
    if (this.$target.prop('disabled')) return false
    var val = this.$target.val()
    this.$select.prop('multiple') && (val = this.$select.val() || []).push(this.$target.val())
    this.$select.val(val || this.$target.val()).change()
  }
})

var Options = View.extend({
  tagName: 'ul',
  className: 'jSelect options',

  initialize: function() {
    this.render()
  },

  render: function() {
    this.$el.empty()
    _(this.$target.children()).each(function(child) {
      var $target = $(child)
      if ($target.is('option') && _optionEmpty($target))
        return true
      this.$el.append(new Option({
        $select: this.$select,
        $target: $target
      }).$el)
    }, this)
    return this
  },

  alignTo: function(target) {
    $target = $(target)
    this.$el
      .addClass('aligned')
      .width(~~$target.innerWidth())
    return this
  }
})

var Selection = View.extend({
  tagName: 'span',
  events: { 'click .x': '_deselect' },

  initialize: function(options) {
    this.multiple = this.$select.prop('multiple')
    this.deselect = _optionEmpty(this.$select.find('option:first'))
    this.placeholder = options.placeholder
    this.render()
  },

  render: function() {
    this.$el
      .text(this.$target.text() || this.placeholder)
      .toggleClass('multiple rounded', this.multiple)
      .toggleClass('placeholder disabled', !this.$target.length || _optionEmpty(this.$target))
    if (this.multiple || this.deselect)
      !_optionEmpty(this.$target) && this.$el.append('<abbr class="icon x"/>')
    return this
  },

  _deselect: function() {
    var val = this.multiple ? _(this.$select.val()).without(this.$target.val()) : null
    this.$select.val(val).change()
    return false
  }
})

var jSelect = View.extend({
  MULTI_TEMPLATE: '<input type="text"/>',
  SINGLE_TEMPLATE: '<b class="rounded right"><abbr class="icon down"></abbr></b>',

  className: 'jSelect container rounded',
  events: { 'click': '_toggle' },

  initialize: function(options) {
    this.placeholder = options.placeholder || this.$target.attr('placeholder') || this.$target.attr('data-placeholder') ||'Choose an item'
    this.$target.on('change', this.render)
    this.createSubViews()
    this.render()
  },

  createSubViews: function() {
    this.list = new Options({ $target: this.$target })
    this.list.$el.addClass('rounded bottom')
  },

  render: function() {
    this.$el
      .html(this.$target.prop('multiple') ? this.MULTI_TEMPLATE : this.SINGLE_TEMPLATE)
      .css('width', this.options.width || this.$target.width())
      .insertAfter(this.$target)
      .after(this.list.$el)
    var i = 0, $selections = this.$target.find('option[value!=""]:selected')
    Array.prototype.reverse.call($selections)
    do { this.add($selections[i]) }
    while (++i < $selections.length)
    this.list.alignTo(this.$el)
    return this
  },

  add: function(selection) {
    new Selection({
      $select: this.$target,
      $target: $(selection),
      placeholder: this.placeholder
    }).$el.prependTo(this.$el)
  },

  toggle: function(show) {
    show = (show === undefined) ? !this.$el.hasClass('open') : show
    this.$('b abbr')
      .toggleClass('up', show)
      .toggleClass('down', !show)
    this.$el.toggleClass('open top', show)
    this.list.$el.toggleClass('open', show)
    show && this.$('input').focus()
  },

  _toggle: function() {
    this.toggle()
  },

  _clear: function(e) {
    console.dir(e)
    this.$target.val('').change()
    return false
  }
})

$.fn.jSelect = function(method, options) {
  return this.each(function() {
    var $this = $(this),
        view = $this.data('jSelect')
    if (!view) {
      options = method || options || {}
      view = new jSelect(_.extend({ $target: $this }, options))
      $this.data('jSelect', view)
      $(document).on('click.jSelect', function(e) {
        if (e.target !== view.el && view.$el.has(e.target).length === 0)
          view.toggle(false)
      })
      return view
    }
    if (!method) return $.error('Target already initialized')
    if (!view[method]) return $.error('Method "'+method+'" not found')
    return view[method].apply(view, Array.prototype.slice.call(arguments, 1))
  })
}

})(jQuery, Backbone, _);