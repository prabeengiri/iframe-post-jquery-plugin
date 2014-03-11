/**
 * jQuery IframePost 0.1
 * 
 * CopyRight 2014 Prabin Giri
 *  
 * Download Source: 
 *   https://github.com/prabeengiri/IframePost/tree/master
 * Depends:
 *   jquery.js
 * 
 * Use POST method to post data into iframe instead of GET.
 * 
 * This is the simple Jquery plugin which lets send the POST 
 * request on the IFrame instead of GET. This is created in order 
 * to avoid the IE problem that limits the total characters(3926) on 
 * the URL. It assumes that Iframe already has the 'src' attribute 
 * with its URL value..
 * 
 * 
 */

(function($) {
  $.fn.IframePost = function ($params) { 
    var postData = function($iframe) {
      if (isIframeValid($iframe)) { 
        $src = $iframe.data('src');
        $form = submitData($src, $iframe.attr('name'));
      }
    };
    
    /**
     * Removes the original source of the iframe so that we can post the data.
     * It copies the value of src attribute into the iframe object itself
     * which can be retrieved from the jquery .data('src') API.
     * 
     * This has to be invoked on document ready.
     * 
     * @param $iframe JqueryObject
     *   Jquery Iframe Object.
     */
    var stopAllIframesFromLoading = function ($iframes) {
      $iframes.each(function() { 
        $(this).data('src' , $(this).attr('src')); 
        $(this).removeAttr('src');    
      });
    };
    
    /**
     * Check if Iframe is valid or not.
     * 
     * @throws Error
     */
    var isIframeValid = function ($iframe) {
      
      // Check if supplied element is iframe or not.
      if ($iframe.get(0).nodeName.toLowerCase() != "iframe") {
        throw new Error("IframePost: Supplied Element is not Iframe");
        return false;
      }
      
      // Check if iframe has same id and name or not
      if($iframe.attr('id') == "" || $iframe.attr('name') == "") {
        throw new Error("IframePost: Iframe Id or Iframe name must not be empty.");
        return false;
      }
        
      if($iframe.attr('id') !=  $iframe.attr('name')) {
        throw new Error("IframePost: Iframe Id and Iframe name must be same.");
        return false;
      }
        
      return true;
    };
    
    /**
     * Submits the Form to the Proper URL and proper iframe
     * target.
     * 
     * Hitting multiple Iframe at the same time sometimes causes fail in the request
     * on the client side. That's why delay is necessary.
     * 
     * @param $action String
     *   URL where form sends the post data.
     *   
     * @param $targetIframeName String
     *   Iframe where Form posts the data.
     *   
     * @return JQueryObject
     *   JQuery Form Object.       
     */
    var submitData = function ($action, $targetIframeName) {
      
      $form = createForm(new URLParser($action) , $targetIframeName);
      $form.appendTo('body').submit().delay(1000).remove();
      // Purpose of the Form is done, so deatch from the DOM.
      $("#" + $targetIframeName ).addClass('request-type-post');
    };
    
    /**
     * Create Form and Append the Hidden element to be sent for the POST
     * 
     * @param URLParser $url
     *   URLParser Object.
     *   
     * @return jQueryObject
     *   jQuery Form Object.
     */
    var createForm = function ($url, $targetIframeName) { 
      var $form = $('<form/>', {
        action : $url.getURLPath(),
        method : 'post',
        target : $targetIframeName,
        id : "form" + $targetIframeName
      });
      
      // Check if parameter is object or not.
      var $parameters = $url.getParameters();
      
      if (typeof $parameters != "object") {
        throw new Error("IframePost : Argument '$parameters' is not an object.");
      };
      
      // Append Hidden Input Element.
      for (prop in $parameters) { 
        $form.append(createHiddenInput(prop, $parameters[prop]));
      };
      return $form;
    };
    
    
    /**
     * Creates Hidden Input element which is used hold the post data.
     * 
     * @param string $name
     *   Name of input element, Key in the Post Data.
     * 
     * @param string $value
     *   Value of the hidden input element, Value in the Post Data. 
     */
    var createHiddenInput = function ($name, $value) {
      return jQuery('<input/>', {
        name : $name,
        value : $value,
        type : "hidden"
      });
    }; 
    
    /**
     * This object Parses the URL into the sub component
     * 
     * @param string url
     *   Complete URL
     */
    var URLParser = function (url) { 
      
      this.url = url;
      
      /**
       * Javascript anchor object has its own properties that returns the 
       * sub components of the URL. But anchor object needs to have 'href'
       * attribtue.
       */
      this.a = document.createElement('a');
      
      this.a.href = this.url;
      
      // Get the protocol of the URL , http:, https:, ftp:
      this.getProtocol = function() {
        return this.a.protocol;
      };
      
      /**
       * We cannot proceed further, if provided URL is not valid.
       * 
       * @param $url string
       *   URL provided for parsing.
       */
      this.isURLValid = function(url) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(s); 
      };
      
      /**
       * Get the Complete Path without query string.
       * including protocol and hostname
       * 
       * @return string
       *   Full URL http://test.com/test/test.php
       */
      this.getURLPath = function () {
        return this.getProtocol()  + "//" + this.a.hostname + "/" + this.pathname();
      };
      
      /**
       * Returns only pathname Eg /test/test.php
       * 
       * @return string
       *   URL pathname
       */
      this.pathname = function() {
        if (this.a.pathname.indexOf('/') == 0) {
          // Matches only first occurence unless /g is provided.
          return this.a.pathname.replace("/", '');
        }
        return this.a.pathname;
      };
      
      /**
       * Returns unformated query string without ? symbol.
       * 
       * @return string
       *   Unformatted raw query string. 
       */
      this.getQueryString = function() {
        return this.a.search.replace('?', '');
      };
      
      /**
       * Returns the query string as object with properties and
       * value
       * 
       * @return object
       *   Object with key value pair.    
       */
      this.getParameters = function() {
        var $parameters = this.getQueryString();
        var params = {}, queries, temp, i, l;
        // Split into key/value pairs
        queries = $parameters.split("&");
        
        // Convert the array of strings into an object
        for ( i = 0, l = queries.length; i < l; i++ ) {
          temp = queries[i].split('=');
          params[temp[0]] = temp[1];
        }
        return params;
      };
      
      if (!this.isURLValid(url)) {
        throw new Error("URLParser: URL supplied is not valid URL.");
      }
    };
    
    
    // Self Invoking Function 
    (function init(iframes) {
      //Stop Iframe from making GET request.
      stopAllIframesFromLoading(iframes);
      
      var counter = 0;
      // If only 1 Iframe , then we don't need to go to SerInterval Function.
      postData(iframes.eq(counter++));
      var c = setInterval(function() {
        if (counter == iframes.length) {
          clearInterval(c);
        };
        postData(iframes.eq(counter++));
      }, 1000);  
    })(this);
        
  };  
})(jQuery);
