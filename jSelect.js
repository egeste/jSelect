(function($) {

var View = Backbone.View.extend({
  constructor: function(options) {
    _.bindAll(this)
    this.$select = options.$select
    this.$target = options.$target
    Backbone.View.apply(this, arguments)
  }
})

var OptionView = View.extend({
  tagName: 'li',
  events: { 'click': '_select' },

  initialize: function() {
    if (this.isGroup()) {
      this.list = new OptionsView({
        $select: this.$select,
        $target: this.$target
      })
      this.$el.addClass('group')
    }

    this.render()
  },

  render: function() {
    if (!this.$target.val() && !this.$target.text())
      return this.remove()

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
    this.$select.val(this.$target.val()).change()
  }
})

var OptionsView = View.extend({
  tagName: 'ul',
  className: 'jSelect options',

  initialize: function() {
    this.render()
  },

  render: function() {
    this.$el.empty()

    _(this.$target.children()).each(function(child) {
      var $target = $(child)

      if ($target.is('option') && !$target.val() && !$target.text())
        return true

      this.$el.append(new OptionView({
        $select: this.$select,
        $target: $target
      }).$el)

    }, this)

    return this
  },

  alignTo: function(target) {
    $target = $(target)

    var width = $target.innerWidth()

    this.$el
      .width(width)
      .addClass('aligned')

    return this
  },

  isVisible: function() {
    return this.$el.is(':visible')
  }
})

var jSelect = View.extend({
  className: 'jSelect container rounded',
  events: {
    'click': '_toggle',
    'click .x': '_clear'
  },

  initialize: function(options) {
    var _this = this
    $(document).on('click.jSelect', function(e) {
      if (e.target !== _this.el && _this.$el.has(e.target).length === 0)
        _this.toggle(false)
    })

    this.$target.after(this.$el)

    this.width = options.width || this.$target.width()
    this.placeholder = options.placeholder || this.$target.attr('placeholder') || 'Choose an item'

    this.list = new OptionsView({
      $select: this.$target,
      $target: this.$target
    })
    this.$el.after(this.list.$el.addClass('rounded bottom'))

    this.$target.on('change', this.render)
    this.render()
  },

  render: function() {
    this.$el
      .html(this.text())
      .css('width', this.width)
      .append($('<b class="rounded right"><abbr class="icon down"></abbr></b>'))

    if (this.canEmpty() && this.$target.val())
      $('<abbr class="icon x"/>').appendTo(this.$el)

    this.list.alignTo(this.$el)

    return this
  },

  canEmpty: function() {
    var firstOption = this.$target.find('option:first')
    return !(firstOption.val() && firstOption.text())
  },

  text: function() {
    var text = this.$target.find(':selected').text(),
        html = $('<span/>').text(text || this.placeholder)
    return html.toggleClass('placeholder', !text)
  },

  toggle: function(show) {
    show = (show === undefined) ? !this.$el.hasClass('open') : show

    this.$('b abbr')
      .toggleClass('up', show)
      .toggleClass('down', !show)

    this.$el.toggleClass('open top', show)
    this.list.$el.toggleClass('open', show)
  },

  _toggle: function() {
    this.toggle()
  },

  _clear: function() {
    this.$target.val('').change()
    return false
  }
})

$.fn.jSelect = function(method, options) {
  return this.each(function() {
    var $this = $(this),
        view = $this.data('jSelect')

    if (!method && !view) {
      options = options || {}
      view = new jSelect(_.extend({ $target: $this }, options))
      $this.data('jSelect', view)
      return view
    }

    if (method && view && view[method])
      return view[method].apply(view, Array.prototype.slice.call(arguments, 1))

    if (!method || !view[method])
      return $.error('Method "'+method+'"" not found')

    if (!view)
      return $.error('Ya dun goofed')

  })
}

})(jQuery);