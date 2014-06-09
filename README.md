IframePost 0.1
==========

Use POST method to post data into iframe instead of GET

This is the simple Jquery plugin which lets send the POST request on the IFrame instead of GET. This is created in order
to avoid the IE problem that limits the total characters(3926) on the URL. It assumes that Iframe already has the 
'src' attribute with its URL value..


##Usage: 
```javascript
  $('#iframe').IframePost();

  // Imporant: Throws error if Iframe does not have src or empty or invalid source attribute
```
