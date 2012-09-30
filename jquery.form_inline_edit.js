/*!
 * Form Inline Edit
 * http://map.placemarklist.com/2011/08/form-inline-edit.html
 * Copyright (c) 2011-2012 Steven Chung
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */

(function($){
    $.fn.extend({
        form_inline_edit: function(options) {
            var defaults = {
                _id: null,
                _class: "form_inline_text_field",
                textarea: false,
                return_key_finish: true,
                select_all: false,
                undo_empty: true,
                empty_text: "&nbsp;&nbsp;&nbsp;",
                valid_check: function(value) { return true; },
                started: null,
                finished: null,
                always_edit: false,
                blur_ignore: [],
                start_delay_time: 100
            };
            //start: function() {}
            //finished: function(value, valid) { }
            options = $.extend(defaults, options);

            var id_index = 0;
            return this.each(function() {
                $.form_inline_edit($(this), options, id_index);
            });
        },
        show_text_field : function(focus) { return this.trigger('show_text_field', focus); },
        hide_text_field : function() { return this.trigger('hide_text_field'); }
    });

    $.form_inline_edit = function($self, options, id_index) {
        function d(param, def) { return $.isDefined(param) ?  param : def; }

        var $text_field = create_text_field();
        $self.after($text_field);

        $self.click(function(e) {
            e.preventDefault();
            start();
        });

        //from http://stackoverflow.com/questions/4520108/cancelling-blur-handler-based-on-item-that-was-clicked
        var timer;
        $.each(options.blur_ignore, function(index, value) {
            value.click(function() { if (timer) { clearTimeout(timer); timer = null; } });
        });
        $text_field.blur(function() {
            timer = setTimeout(function() { timer = null; finish(); }, 150);
        });

        if (options.return_key_finish) {
            $text_field.keydown(function(e){
                if( (e.keyCode == 13 && !e.shiftKey) ) {
                    e.preventDefault();
                    $text_field.blur();
                }
            });
        }

        if (!options.valid_check($self.html()))
            start();
        if (is_empty($self.html()))
            $self.html(options.empty_text);
        if (options.always_edit) {
            $text_field.focus(function() { start(false); });
            show_text_field();
        }

        $self.bind('show_text_field', function(event, focus) { return start(focus); });
        $self.bind('hide_text_field', function() { return finish(); });

        function start(focus) {
            setTimeout(function() {
                if (!options.always_edit) {
                    focus = d(focus, true);
                    show_text_field();
                    if (focus) {
                        $text_field.focus();
                        if (options.select_all)
                            $text_field.select();
                    }
                }

                if (options.started) options.started();
            }, options.start_delay_time)
        }
        function show_text_field() {
            $self.hide();
            $text_field.val($self.html().replace(options.empty_text, ""));
            $text_field.show();
        }
        function finish() {
            var valid = options.valid_check($text_field.val());
            var empty = is_empty($text_field.val());
            var value = $text_field.val();

            if (valid || (empty && options.undo_empty && $self.html() != options.empty_text)) {
                if (!options.always_edit) {
                    $self.show();
                    $text_field.hide();
                }

                if (!(empty && options.undo_empty)) {
                    if (!options.always_edit) {
                        if (empty)
                            $self.html(options.empty_text);
                        else
                            $self.html(value);
                    }
                    $($self.attr('href')).val(value);
                }
            }

            if (options.finished) options.finished(value, options.valid_check(value));
        }

        function is_empty(value) {
            return $.trim(value).length == 0;
        }

        function create_text_field() {
            var $text_field;
            if (options.textarea) {
                $text_field = $(document.createElement('textarea'));
            }
            else {
                $text_field = $(document.createElement('input'));
                $text_field.attr({ type: 'text' });
            }

            $text_field.addClass(options._class);
            if (options._id) {
                $text_field.attr( { id: options._id + (id_index > 0 ? id_index : "")});
                id_index++;
            }
            $text_field.hide();

            return $text_field;
        }
    };
})(jQuery);