/**
 * Uni-Form jQuery Plugin
 *
 * Provides form actions for use with the Uni-Form markup style
 * This version adds additional support for client side validation
 *
 * Author: Ilija Studen for the purposes of Uni-Form
 * 
 * Modified by Aris Karageorgos to use the parents function
 * 
 * Modified by Toni Karlheinz to support input fields' text
 * coloring and removal of their initial values on focus
 * 
 * Modified by Jason Brumwell for optimization, addition
 * of valid and invalid states and default data attribues
 * 
 * Modified by LearningStation to add support for client
 * side validation routines. The validation routines based on an
 * open source library of unknown authorship.
 *
 * @see http://sprawsm.com/uni-form/
 * @license MIT http://www.opensource.org/licenses/mit-license.php
 */
jQuery.fn.uniform = function(settings) {
    /**
     * prevent_submit : enable with either true or class on form of "preventSubmit"
     * ask_on_leave   : enable with either true or class on form of "askOnLeave"
     */
    settings = jQuery.extend({
        prevent_submit : false,
        ask_on_leave   : false,
        valid_class    : 'valid',
        invalid_class  : 'invalid',
        error_class    : 'error',
        focused_class  : 'focused',
        holder_class   : 'ctrlHolder',
        field_selector : 'input, textarea, select',
        default_value_color: "#AFAFAF"
    }, settings);

    /**
     * Internationalized language strings for validation messages
     *
     * @var Object
     */
    var i18n_en = {
        required  : '&s is required',
        minlength : '%s should be at least %d characters long',
        min       : '%s should be greater than or equal to %d',
        maxlength : '%s should not be longer than %d characters',
        max       : '%s should be less than or equal to %d',
        same_as   : '%s is expected to be same as %s',
        email     : '%s is not a valid email address',
        url       : '%s is not a valid URL',
        number    : '%s needs to be a number',
        integer   : '%s needs to be a whole number',
        alpha     : '%s should contain only letters (without special characters or numbers)',
        alphanum  : '%s should contain only numbers and letters (without special characters)',
        phrase    : '%s should contain only alphabetic characters, numbers, spaces, and the following: . , - _ () * # :',
        phone     : '%s should be a phone number',
        date      : '%s should be a date (mm/dd/yyyy)',
        callback  : 'Failed to validate %s field. Validator function (%s) is not defined!',
    };

    /**
     * Supported validators
     *
     * @var Object
     */
    var validators = {
    
        /**
         * Get the value for a validator that takes parameters
         *
         * @param string name
         * @param string all classes on element
         *
         * @return mixed || null
         */
        get_val : function(name, classes, default_value) {
            var value = default_value;
            classes = classes.split(' ');
            for(var i = 0; i < classes.length; i++) {
                if(classes[i] == name) {
                    if((classes[i + 1] != 'undefined') && ('val-' === classes[i + 1].substr(0,4))) {
                        value = parseInt(classes[i + 1].substr(4),10);
                        return value;
                    }
                }
            }
            return value;
        },
        
        /**
         * Check if value of specific field is present, whitespace will be counted as empty
         *
         * @param jQuery field
         * @param string caption
         */
        required : function(field, caption) {
            if(jQuery.trim(field.val()) == '') {
                return i18n('required', caption);
            } else {
                return true;
            }
        },
    
        /**
         * Validate is value of given field is shorter than supported
         *
         * @param jQuery field
         * @param sting caption
         */
        validateMinLength : function(field, caption) {
            var min_length = this.get_val('validateMinLength', field.attr('class'), 0);

            if((min_length > 0) && (field.val().length < min_length)) {
                return i18n('minlength', caption, min_length);
            } else {
                return true;
            }
        },
        
        /**
         * Validate is if value is lesser than min
         *
         * @param jQuery field
         * @param sting caption
         */
        validateMin : function(field, caption) {
            var min_val = this.get_val('validateMin', field.attr('class'), 0);
      
            if((parseInt(field.val(),10) < min_val)) {
                return i18n('min', caption, min_val);
            } else {
                return true;
            }
        },
    
        /**
         * Validate if field value is longer than allowed
         *
         * @param jQuery field
         * @param string caption
         */
        validateMaxLength : function(field, caption) {
            var max_length = this.get_val('validateMaxLength', field.attr('class'), 0);
      
            if((max_length > 0) && (field.val().length > max_length)) {
                return i18n('maxlength', caption, max_length);
            } else {
                return true;
            }
        },
        
        /**
         * Validate is if value is lesser than min
         *
         * @param jQuery field
         * @param sting caption
         */
        validateMax : function(field, caption) {
            var max_val = this.get_val('validateMax', field.attr('class'), 0);
    
            if((parseInt(field.val(),10) > max_val)) {
                return i18n('max', caption, max_val);
            } else {
                return true;
            }
        },
    
    
        /**
         * Make sure that field has same value as the value of target field
         *
         * @param jQuery field
         * @param string caption
         */
        validateSameAs : function(field, caption) {
            var classes = field.attr('class').split(' ');
            var target_field_name = '';
      
            for(var i = 0; i < classes.length; i++) {
                if(classes[i] == 'validateSameAs') {
                    if(classes[i + 1] != 'undefined') {
                        target_field_name = classes[i + 1];
                        break;
                    }
                }
            }
      
            if(target_field_name) {
                var target_field = jQuery('#' + target_field_name);
                if(target_field.length > 0) {
                    //var target_field_caption = field_caption(field);
                    var target_field_caption = field_caption(target_field);
          
                    if(target_field.val() != field.val()) {
                        return i18n('same_as', caption, target_field_caption);
                    }
                }
            }
      
            return true;
        },
    
        /**
         * Validate if provided value is valid email address
         *
         * @param jQuery field
         * @param string caption
         */
        validateEmail : function(field, caption) {
            if(field.val().match(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)) {
                return true;
            } else {
                return i18n('email', caption)
            }
        },
    
        /**
         * Validate if provided value is valid URL
         *
         * @param jQuery field
         * @param string caption
         */
        validateUrl : function(field, caption) {
            if(field.val().match(/^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i)) {
                return true;
            } else {
                return i18n('url', caption);
            }
        },
    
        /**
         * Number is only valid value (integers and floats)
         *
         * @param jQuery field
         * @param string caption
         */
        validateNumber : function(field, caption) {
            if(field.val().match(/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/) || field.val() == '') {
                return true;
            } else {
                return i18n('number', caption);
            }
        },
    
        /**
         * Whole numbers are allowed
         *
         * @param jQuery field
         * @param string caption
         */
        validateInteger : function(field, caption) {
            if(field.val().match(/(^-?\d\d*$)/) || field.val() == '') {
                return true;
            } else {
                return i18n('integer', caption);
            }
        },
    
        /**
         * Letters only
         *
         * @param jQuery field
         * @param string caption
         */
        validateAlpha : function(field, caption) {
            if(field.val().match(/^[a-zA-Z]+$/)) {
                return true;
            } else {
                return i18n('alpha', caption);
            }
        },
    
        /**
         * Letters and numbers
         *
         * @param jQuery field
         * @param string caption
         */
        validateAlphaNum : function(field, caption) {
            if(field.val().match(/\W/)) {
                return i18n('alphanum', caption);
            } else {
                return true;
            }
        },
    
        /**
         * Simple phrases
         *
         * @param jQuery field
         * @param string caption
         */
        validatePhrase : function(field, caption) {
            if((field.val() == '') || field.val().match(/^[\w\d\.\-_\(\)\*'# :,]+$/i)) {
                return true;
            } else {
                return i18n('phrase', caption);
            }
        },
        
        /**
         * Phone number
         *
         * @param jQuery field
         * @param string caption
         */
        validatePhone : function(field, caption) {
            if(field.val().match('/^1?-?(\d{3})?-?(\d{2})?\d-?(\d{4})$/')) {
                return true;
            } else {
                return i18n('phone', caption);
            }
        },
        
        /**
         * Phone number
         *
         * @param jQuery field
         * @param string caption
         */
        validateDate : function(field, caption) {
            if(field.val().match('(1[0-9]|[1-9])/([1-3][0-9]|[1-9])/((19|20)[0-9][0-9]|[0-9][0-9])')) {
                return true;
            } else {
                return i18n('date', caption);
            }
        },
    
        /**
         * Callback validator
         *
         * Lets you define your own validators. Usage:
         *
         * <input name="myinput" class="validateCallback my_callback" />
         *
         * This will result in UniForm searching for window.my_callback funciton and
         * executing it with field and caption arguments. Sample implementation:
         *
         * window.my_callback = function(field, caption) {
         *   if(field.val() == '34') {
         *     return true;
         *   } else {
         *     return caption + ' value should be "34"';
         *   }
         * }
         *
         * @param jQuery field
         * @param caption
         */
        validateCallback : function(field, caption) {
            var classes = field.attr('class').split(' ');
            var callback_function = '';
      
            for(var i = 0; i < classes.length; i++) {
                if(classes[i] == 'validateCallback') {
                    if(classes[i + 1] != 'undefined') {
                        callback_function = classes[i + 1];
                        break;
                    }
                }
            }
      
            if(window[callback_function] != 'undefined' && (typeof window[callback_function] == 'function')) {
                return window[callback_function](field, caption);
            }
      
            return i18n('callback', caption, callback_function);
        }
  
    };

    /** 
     * Simple replacement for i18n + sprintf
     *
     * @param string language for for the local i18n object
     * @param mixed substitution vars
     *
     * @return internationalized string
     */
    var i18n = function(lang_key) {
        var lang_string = i18n_en[lang_key];
        var bits = lang_string.split('%');
        var out = bits[0];
        var re = /^([ds])(.*)$/;
        for (var i=1; i<bits.length; i++) {
            p = re.exec(bits[i]);
            if (!p || arguments[i] == null) continue;
            if (p[1] == 'd') {
                out += parseInt(arguments[i], 10);
            } else if (p[1] == 's') {
                out += arguments[i];
            }
            out += p[2];
        }
        return out;
    }

    /**
     * Apply the Uni-Form bahaviours to the form
     *
     */
    return this.each(function() {
        var form = jQuery(this);
        
        /**
         * Set the results of form validation on the form element
         *
         * @param object $input jQuery form element
         * @param bool   valid  true if the form value passed all validation
         * @param string text   validation error message to display
         *
         * @return null
         */
        var validate = function($input,valid,text) {
            var $p = $input.closest('div.' + settings.holder_class)
                           .andSelf()
                           .toggleClass(settings.invalid_class, !valid)
                           .toggleClass(settings.error_class, !valid)
                           .toggleClass(settings.valid_class, valid)
                           .find('p.formHint');
    
            if (! valid && ! $p.data('info-text')) {
                $p.data('info-text', $p.html());
            }
            else if (valid) {
                text = $p.data('info-text');
            }
    
            if (text) {
                $p.html(text);
            }
        };
        
        /**
         * Select form fields and attach them higlighter functionality
         *
         */
        form.find(settings.field_selector).each(function(){
            var $input = $(this),
                value = $input.val();

            $input.data('default-color',$input.css('color'));

            if (value === $input.data('default-value') || ! value) {
                $input.not('select').css("color", settings.default_value_color);
                $input.val($input.data('default-value'));
            }
        });
        
        /**
         * If we've set ask_on_leave we'll register a handler here
         *
         * We need to seriaze the form data, wait for a beforeunload, 
         * then serialize and compare for changes
         *
         * If they changed things, and haven't submitted, we'll let them
         * know about it
         * 
         */
        if(settings.ask_on_leave || form.hasClass('askOnLeave')) {
            var initial_values = form.serialize();
            $(window).bind("beforeunload", function(e) {
                if(initial_values != form.serialize()) {
                    var leave_page = confirm(i18n('on_leave'));
                    // Return focus or something?
                    return leave_page;
                }
            });
        }
        
        /** 
         * Handle the submission of the form
         *
         * Tasks
         *  * Remove any default values from the form
         *  * If prevent_submit is set true, return false if
         *    there are outstanding errors in the form
         *
         * @return bool
         */
        form.submit(function(){
            form.find(settings.field_selector).each(function(){
                if($(this).val() === $(this).data('default-value')) { $(this).val(""); }
            });
            
            // it would be novel to use prevent_submit to disable the submit button
            // in the blur handler
            //
            // here we could traverse and revalidate, but instead, we check for 
            // invalid and error class markers
            if((settings.prevent_submit || form.hasClass('preventSubmit'))
                && form.find('.' + settings.invalid_class)
                        .add('.' + settings.error_class).length
            ) {
              return false;
            }
            return true;
        });
        
        /**
         * Set the form focus class
         * 
         * Remove any classes other than the focus class and hide the default label text
         *
         */
        form.delegate(settings.field_selector, 'focus', function() {
            form.find('.' + settings.focused_class).removeClass(settings.focused_class);

            var $input = $(this);

            $input.parents().filter('.'+settings.holder_class+':first').addClass(settings.focused_class);
            
            if($input.val() === $input.data('default-value')){
                $input.val("");
            }

            $input.not('select').css('color',$input.data('default-color'));
        });

        /**
         * Validate a form field on the blur event
         * 
         * Search the classnames on the element for the names of 
         * validators, and run them as we find them
         *
         * If the validators fail, we trigger either 'success' or 'error' events
         *
         */
        form.delegate(settings.field_selector, 'blur', function() {
            var $input = $(this);
            var label  = $(this)
                .closest('div.'+settings.holder_class)
                .find('label').text();

            // remove focus from form element
            form.find('.' + settings.focused_class).removeClass(settings.focused_class);
            
            // (if empty or equal to default value) AND not required
            if(($input.val() === "" || $input.val() === $input.data('default-value'))
                && !$input.hasClass('required')
            ){
                $input.not('select').css("color",settings.default_value_color);
                $input.val($input.data('default-value'));
                return;
            }
            
            // run the validation and if they all pass, we mark the color and move on
            var has_validation = false;
            for(validator in validators) {
                if($input.hasClass(validator)){
                    has_validation = true;
                    var validation_result = validators[validator]($input, label);
                    if(typeof(validation_result) == 'string') {
                        $input.trigger('error', validation_result);
                        return;
                    }
                }
            }
            // if it had validation and we didn't return above,
            // then all validation passed
            if (has_validation) {
                $input.trigger('success');
            }
            
            // return the color to the default
            $input.css('color', $input.data('default-color'));
            return;
        });

        /**
         * Handle a validation error in the form element
         * 
         * This will set the field to have the error marker
         * and update the warning text
         *
         * @param event  e
         * @param string validation message
         */
        form.delegate(settings.field_selector,'error',function(e,text) {
            validate($(this), false, text);
        });

        /**
         * Handle a succesfull validation in the form element
         * 
         * Remove any error messages and set the validation 
         * marker to be success
         *
         * @param event  e
         * @param string unused
         */
        form.delegate(settings.field_selector,'success',function(e,text) {
            validate($(this), true);
        });
    });
};

// Auto set on page load
$(document).ready(function() {
    jQuery('form').uniform({ask_on_leave : true});
});

