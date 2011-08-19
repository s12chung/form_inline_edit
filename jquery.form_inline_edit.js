(function($){
    $.fn.form_inline_edit = function(options) {
        var defaults = {
            id: null,
            class: "form_inline_text_field",
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
            var $text_field = create_text_field();
            var $self = $(this);
            $self.after($text_field);

            $text_field.finished = function() {
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
            };
            $text_field.blur($text_field.finished);
            if (options.return_key_finish) {
                $text_field.keydown(function(event){
                    if( (event.keyCode == 13 && !event.shiftKey) ) {
                        $text_field.blur();
                        event.preventDefault();
                        return false;
                    }
                });
            }

            $self.show_text_field = function() {
                $self.hide();

                $text_field.val($self.html().replace(options.empty_text, ""));
                $text_field.show();
                $text_field.focus();
                if (options.select_all)
                    $text_field.select();

                if (options.started) options.started();
            };
            var empty = is_empty($self.html());
            if (!options.valid_check($self.html())) {
                $self.show_text_field();
            }
            if (empty)
                $self.html(options.empty_text);

            $self.click(function() {
                $self.show_text_field();
                return false;
            });
        });

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

            $text_field.addClass(options.class);
            if (options.id) {
                $text_field.attr( { id: options.id + (id_index > 0 ? id_index : "")});
                id_index++;
            }
            $text_field.hide();

            return $text_field;
        }
    };
})(jQuery);