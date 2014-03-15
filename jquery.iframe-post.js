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
 * with its URL value. It does not POST the data if there is no any
 * query string present in the Iframe source.
 * 
 */

(function($) {
  $.fn.IframePost = function ($params) {
    
    // This class is used when there post request to made, to avoid another
    // Post request or recursion.
    var postDataProgressIdentifierClass = "iframe-post-data-sending";
    
    /**
     * This is actually a Fascade which Post the Data to the Iframe via Form.
     * 
     * @param JQueryObject $iframe
     *   JQuery Iframe Object where Data is being posted.
     */
    var postData = function($iframe) {
     
      // Filter the URL if they have hash.
      $url = filterURL($iframe.attr('src'));
      
      // Validate If Post is feasible, checking if the URL has query string or not
      // As this plugin can only post the data if Iframe source has the query string.
      if (!urlHasQueryString($url)) {
        return false;   
      }
      
      // Validate if Iframe has all the pre requisite attributes and whatnot.
      if (isIframeValid($iframe)) {
        $form = submitData($url, $iframe.attr('name'));
      }
    };
    
    /**
     * Its required to check if the iframe source has query string or not, 
     * otherwise no point of going further.
     * 
     * @param src string
     *   URL used in the Iframe.
     */
    var urlHasQueryString = function (src) { 
      var a = document.createElement('a');
      a.href = src;
      if (a.search) {
        return true; 	  
      }
      return false;
    };
    
    /**
     * Filter URL if it has hash tags.
     * 
     * @param
     *   URL used in the Iframe.
     */
    var filterURL = function(url) {
      return url.split('#')[0]; 
    };
    
    /**
     * Check if Iframe is valid or not.
     * 
     * @throws Error
     */
    var isIframeValid = function ($iframe) {
      // Check if supplied element is iframe or not.
      if ($iframe.prop("nodeName").toLowerCase() != "iframe") {
        throw new Error("IframePost: Supplied Element is not Iframe");
        return false;
      }
      
      // Check if iframe has same id and name or not.
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
     * @param $action String
     *   URL where form sends the post data.
     *   
     * @param $targetIframeName String
     *   Iframe where Form posts the data.
     *   
     * @return void
     */
    var submitData = function ($url, $targetIframeName) {
      
      $("#" + $targetIframeName).addClass(postDataProgressIdentifierClass);
      var $form = new IframePostForm(new URLParser($url) , $targetIframeName);
      $form._submit();
      setIframeCountAttribute($("#" + $targetIframeName));
      
    };
    
    /**
     * For debugging and other purpose, this might be helpful
     * to have number of post we did not this particular Iframe.
     * 
     * It sets the custom attribute 'iframe-post-counter'<counter> and
     * add as post request increases.
     */
    var setIframeCountAttribute = function ($iframe) { 
      if (!$iframe.attr('iframe-post-count')) {
        $iframe.attr('iframe-post-count', "1");
      } else {
        $iframe.attr('iframe-post-count', parseInt($iframe.attr('iframe-post-count')) + 1);
      }
    };
    
    /**
     * Create Form and Append the Hidden element to be sent for the POST.
     * 
     * @param URLParser $url
     *   URLParser Object.
     *   
     * @return Form Object
     *   Form Object, with public functions 'formId' and '_submit'.
     *   
     * @throws TypeError
     *   When parameter is not of type Object.
     */
    var IframePostForm = function ($url, $targetIframeName) {
      
      this.url = $url;
      this.iframeName = $targetIframeName;
      var self = this;
      
      // Creates a Form with Hidden HTML elements.
      var createForm = function() {
        var $form = $('<form/>', {
          action : self.url.getURLPath(),
          method : 'post',
          target : self.iframeName,
          id : self.getId()
        });
        
        var $parameters = $url.getParameters();
        // Check if parameter is object or not.
        if (typeof $parameters != "object") {
          throw new TypeError("IframePost : Argument '$parameters' is not an object.");
        };
        
        // Append Hidden Input Element.
        for (prop in $parameters) { 
          $form.append(createHiddenInput(prop, $parameters[prop]));
        };
        return $form;  
      };
      
      /**
       * Returns the Form Id.
       * 
       * @return String
       *   XHTML Form Id.
       */
      this.getId = function() { 
        return "form" + this.iframeName;
      };
      
      
      /**
       * Returns the JQuery Object of the Form.
       * 
       * @return jQueryObject
       */
      this.getJQueryObject = function () {
        return $("#" + this.formId());
      };
      
      /**
       * Submits the form along with its hidden element
       * to make a post request to the iframe.
       * 
       * After form is posted there is no need to have it in the DOM, so remove it
       * after some delay.
       */
      this._submit = function() { 
        var $form = createForm();
        $form.appendTo('body').submit().delay(2000).remove();
        $form.appendTo(document.body);
        //$form[0].submit();
        //$form.delay(2000).remove();
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
        return jQuery('<input>', {
          name : $name,
          value : $value,
          type : "hidden"
        });
      };
    };
    
    /**
     * This object Parses the URL into the sub component.
     * 
     * @param string url
     *   Complete URL.
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
      
      // Get the protocol of the URL , http:, https:, ftp: .
      this.getProtocol = function() {
        return this.a.protocol;
      };
      
      /**
       * We cannot proceed further, if provided URL is not valid.
       * 
       * @param $url string
       *   URL provided for parsing.
       * @return boolean
       *   
       */
      this.isURLValid = function(url) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3})) |'+ // OR ip (v4) address
          '()' + // Domain name can be empty sometimes.
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return pattern.test(url); 
      };
      
      /**
       * Get the Complete Path without query string.
       * including protocol and hostname.
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
       * value.
       * 
       * Decode all the URI component as IE might double encode if
       * parameters are already encoded.
       * 
       * @return object
       *   Object with key value pair.    
       */
      this.getParameters = function() {
        var $parameters = this.getQueryString();
        var params = {}, queries, temp, i, l;
        // Split into key/value pairs.
        queries = $parameters.split("&");
        
        // Convert the array of strings into an object.
        for (i = 0, l = queries.length; i < l; i++) {
          temp = queries[i].split('=');
          params[temp[0]] = decodeURIComponent(temp[1]);
        }
        return params;
      };
      
      if (!this.isURLValid(url)) {
        throw new Error("URLParser: URL supplied is not valid URL: " + url);
      }
    };
    
    window.IframePostLoaded  = function (event) {
      if ( !event ) {
        event = window.event;
      }
      var callerElement = event.target || event.srcElement;
      
      $iframe = $(callerElement);
      if (!$iframe.hasClass(postDataProgressIdentifierClass)) {
        postData($iframe);
      }
      else {
        $iframe.removeClass(postDataProgressIdentifierClass);
      }
    };
    
    /**
     * Self Invoking Function
     * 
     * Attach the onload events to all the matched iframes.Therefore whenever
     * there is the change in source of Iframe we can apply the post method.
     * 
     * Important: When we attach the onload event to the iframe, it calls when we
     * Post the Data via Form, which leads to the infinite recursion. To avoid
     * this we put the class on Iframe as soon as post request is done and which
     * again invokes onload and then "postData" check if class exists on the iframe
     * or not, if yes deletes the class , so that iframe can get prepared for the
     * next onload.  
     * 
     * @param $iframes JQueryObject
     *   jQuery object that represents all matched Iframes.
     */
    (function init(iframes) {
      return iframes.each(function() {
        //Jquery 'load' event on Iframe was not triggered on IE on document ready
        //$(this).attr('onload', 'javascript:IframePostLoaded(this);');
        $iframeHTML = $(this).get(0);
        if ($iframeHTML.attachEvent) $iframeHTML.attachEvent('onload', IframePostLoaded);
        else $iframeHTML.addEventListener('load', IframePostLoaded, false);
        
        // ON IE, ON document ready event 'onload' does not gets Triggered, 
        // so post Data for Iframes by immediately when document is ready and
        // Iframe source is loaded.
        postData($(this));
      });
    })(this);
  };  
})(jQuery);
