/**
  Phonegap DatePicker Plugin
  https://github.com/sectore/phonegap3-ios-datepicker-plugin

  Copyright (c) Greg Allen 2011
  Additional refactoring by Sam de Freyssinet

  Rewrite by Jens Krause (www.websector.de)

  MIT Licensed
*/

var exec = require('cordova/exec');
/**
 * Constructor
 */
function DatePicker() {
    this._callback;
}

/**
 * Android themes
 * @todo Avoid error when an Android theme is define...
 */
DatePicker.prototype.ANDROID_THEMES = {
  THEME_TRADITIONAL          : 1, // default
  THEME_HOLO_DARK            : 2,
  THEME_HOLO_LIGHT           : 3,
  THEME_DEVICE_DEFAULT_DARK  : 4,
  THEME_DEVICE_DEFAULT_LIGHT : 5
};

/**
 * show - true to show the ad, false to hide the ad
 */
DatePicker.prototype.show = function(options, cb) {
    var padDate = function(date) {
      if (date.length == 1) {
        return ("0" + date);
      }
      return date;
    };

    var formatDate = function(date){
      // date/minDate/maxDate will be string at second time
      if (!(date instanceof Date)) {
        date = new Date(date)
      }
      date = date.getFullYear()
            + "-"
            + padDate(date.getMonth()+1)
            + "-"
            + padDate(date.getDate())
            + "T"
            + padDate(date.getHours())
            + ":"
            + padDate(date.getMinutes())
            + ":00Z";

      return date
    }

    if (options.date) {
        options.date = formatDate(options.date);
    }

    if (options.minDate) {
        options.minDate = formatDate(options.minDate);
    }

    if (options.maxDate) {
        options.maxDate = formatDate(options.maxDate);
    }

    if (options.popoverArrowDirection) {
        options.popoverArrowDirection = this._popoverArrowDirectionIntegerFromString(options.popoverArrowDirection);
        console.log('ha options', this, options.popoverArrowDirection);
    }

    // Detectar iPhone 13 para usar calendario inline
    var isIPhone13 = this._isIPhone13();
    var selectedStyle = isIPhone13 ? 'inline' : 'wheels';
    
    console.log('Estilo seleccionado:', selectedStyle);
    
    var defaults = {
        mode: 'date',
        date: new Date(),
        allowOldDates: true,
        allowFutureDates: true,
        minDate: '',
        maxDate: '',
        doneButtonLabel: 'Done',
        doneButtonColor: '#007AFF',
        cancelButtonLabel: 'Cancel',
        cancelButtonColor: '#007AFF',
        locale: "NL",
        x: '0',
        y: '0',
        minuteInterval: 1,
        popoverArrowDirection: this._popoverArrowDirectionIntegerFromString("any"),
        locale: "en_US",
        preferredDatePickerStyle: selectedStyle // Inline solo para iPhone 13
    };
    

    for (var key in defaults) {
        if (typeof options[key] !== "undefined")
            defaults[key] = options[key];
    }
    this._callback = cb;

    exec(null,
      null,
      "DatePicker",
      "show",
      [defaults]
    );
};

DatePicker.prototype._dateSelected = function(date) {
    var d = new Date(parseFloat(date) * 1000);
    if (this._callback)
        this._callback(d);
};

DatePicker.prototype._dateSelectionCanceled = function() {
    if (this._callback)
        this._callback();
};

DatePicker.prototype._UIPopoverArrowDirection = {
    "up": 1,
    "down": 2,
    "left": 4,
    "right": 8,
    "any": 15
};

DatePicker.prototype._popoverArrowDirectionIntegerFromString = function (string) {
    if (typeof this._UIPopoverArrowDirection[string] !== "undefined") {
        return this._UIPopoverArrowDirection[string];
    }
    return this._UIPopoverArrowDirection.any;
};

DatePicker.prototype._isIPhone13 = function() {
    
    // Método 1: Detectar por modelo del dispositivo
    if (window.device && window.device.model) {
        var model = window.device.model.toLowerCase();
        console.log('Modelo del dispositivo:', model);
        // iPhone 13 modelos: iPhone14,2 (13), iPhone14,3 (13 Pro), iPhone14,4 (13 mini), iPhone14,5 (13 Pro Max)
        var isModel13 = model.includes('iphone14,2') || 
                       model.includes('iphone14,3') || 
                       model.includes('iphone14,4') || 
                       model.includes('iphone14,5');
        if (isModel13) {
            console.log('iPhone 13 detectado por modelo');
            return true;
        }
    }
    
    // Método 2: Detectar por resolución de pantalla
    if (window.screen) {
        var width = window.screen.width;
        var height = window.screen.height;
        // iPhone 13 resolución: 1170x2532 o 2532x1170 (dependiendo de orientación)
        var isResolution13 = (width === 1170 && height === 2532) || (width === 2532 && height === 1170);
        if (isResolution13) {
            console.log('iPhone 13 detectado por resolución');
            return true;
        }
    }
    
    // Método 3: Detectar por user agent (para simuladores)
    if (navigator.userAgent) {
        var userAgent = navigator.userAgent.toLowerCase();
        // Buscar referencias a iPhone 13 en el user agent
        var isUserAgent13 = userAgent.includes('iphone13') || 
                           userAgent.includes('iphone 13') ||
                           userAgent.includes('iphone14,2') ||
                           userAgent.includes('iphone14,3') ||
                           userAgent.includes('iphone14,4') ||
                           userAgent.includes('iphone14,5');
        if (isUserAgent13) {
            console.log('iPhone 13 detectado por user agent');
            return true;
        }
    }
    
    // Método 4: Detectar por características específicas del iPhone 13
    if (window.screen && window.devicePixelRatio) {
        var pixelRatio = window.devicePixelRatio;
        var width = window.screen.width;
        var height = window.screen.height;
        
        // iPhone 13 tiene pixel ratio 3 y resolución específica
        if (pixelRatio === 3 && ((width === 390 && height === 844) || (width === 844 && height === 390))) {
            console.log('iPhone 13 detectado por pixel ratio y resolución');
            return true;
        }
    }
    
    // Método 5: Detección específica para simuladores (temporal para testing)
    if (window.screen) {
        var width = window.screen.width;
        var height = window.screen.height;
        
        // Para testing: forzar inline en iPhone 13 simulador
        // iPhone 13 simulador típicamente tiene 390x844
        if ((width === 390 && height === 844) || (width === 844 && height === 390)) {
            console.log('Simulador iPhone 13 detectado - FORZANDO INLINE');
            return true;
        }
    }
    
    console.log('No se detectó iPhone 13, usando wheels');
    return false;
};



var datePicker = new DatePicker();
module.exports = datePicker;

// Make plugin work under window.plugins
if (!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.datePicker) {
    window.plugins.datePicker = datePicker;
}
