/*
 MIT License

 Copyright (c) 2011 Steven Chung

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function d(param, def) { return typeof(param) != 'undefined' ?  param : def; }

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
                finished: null
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
        var $text_field = create_text_field();
        $self.after($text_field);

        $self.click(function() {
            start();
            return false;
        });

        $text_field.blur(finish);
        if (options.return_key_finish) {
            $text_field.keydown(function(event){
                if( (event.keyCode == 13 && !event.shiftKey) ) {
                    $text_field.blur();
                    return false;
                }
            });
        }

        if (!options.valid_check($self.html()))
            start();
        if (is_empty($self.html()))
            $self.html(options.empty_text);

        $self.bind('show_text_field', function(event, focus) { return start(focus); });
        $self.bind('hide_text_field', function() { return finish(); });

        function start(focus) {
            focus = d(focus, true);
            $self.hide();

            $text_field.val($self.html().replace(options.empty_text, ""));
            $text_field.show();
            if (focus) {
                $text_field.focus();
                if (options.select_all)
                    $text_field.select();
            }

            if (options.started) options.started();
        }
        function finish() {
            var valid = options.valid_check($text_field.val());
            var empty = is_empty($text_field.val());
            if (valid || (empty && options.undo_empty && $self.html() != options.empty_text)) {
                $self.show();
                $text_field.hide();

                if (!(empty && options.undo_empty)) {
                    var value = $text_field.val();
                    if (empty)
                        value = options.empty_text;
                    $self.html(value);
                    $($self.attr('href')).val($self.html());
                }
            }
            var final_val = $self.html().replace(options.empty_text, "");
            if (options.finished) options.finished(final_val, options.valid_check(final_val));
            return true;
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