var wechat = require('wechat');
var express = require('express');
var requests = require('request-promise');

//WeChat configuration
var config = {
  token: 'MACFashionStylist',
  appid: 'wx9ad3063c8e8af094'
};

//Connect to Jarvis API
const JARVIS_STG = "";
const headers =  { 'X-Test-Api-Key': ''};
var user_id = '';

//Use express for listening to a port
app = express();
app.use(express.query());

//WeChat request and response
app.use('/wechat', wechat(config, wechat.text(function (message, req, res, next) {
  //Request message
  var message = req.weixin;
  console.log(message);

  //Request body and headers
  var request_body = {
        message: message.Content,
        user: user_id
  };
  var request_obj  = { 
        method: 'POST', json: true, headers: headers,
        body: request_body, uri: JARVIS_STG 
  };

  //Call the Jarvis API           
  return requests(request_obj).then(function (rc) {
      var speak_str = "";
      var list = [];

      console.log(JSON.stringify(rc));

      //Check for text within replies (where replies isn't an array)
      if (rc.replies.text) {
        res.reply(rc.replies.text);
        return res.send();
      }

      //Check for the quick replies
      if (rc.replies.quick_replies) {
        for(i = 0; i < rc.replies.quick_replies.length; i++) {
          list.push({title: rc.replies.quick_replies[i].title});
        }
        res.reply(list);
        return res.send();
      }

     //Loop through the replies
     for (i = 0; i < rc.replies.length; i++) {

          //Check for display text
          if (rc.replies[i].text) {
            speak_str += rc.replies[i].text;

            //If there are not attachments.
            if (rc.replies.length == 1) {
              res.reply(speak_str);
              return res.send();
            } else {
              list.push({title: speak_str});
            }
          }

          //Check for cards
          if (rc.replies[i].attachment && rc.replies[i].attachment.payload.elements) {
            var length = 0;

            //Setting the maximum number of cards to be displayed as list to 4
            if (rc.replies[i].attachment.payload.elements.length < 6) {
              length = rc.replies[i].attachment.payload.elements.length;
            }
            else
            {
              length = 5;
            }


            for(j=0; j<length; j++ )
            {
                var url = "";
                if(rc.replies[i].attachment.payload.elements[j].title && rc.replies[i].attachment.payload.elements[j].subtitle)
                {
                  if (rc.replies[i].attachment.payload.elements[j].default_action) {
                      url = rc.replies[i].attachment.payload.elements[j].default_action.url;
                  }
                  list.push({
                      title: rc.replies[i].attachment.payload.elements[j].title + ", " + rc.replies[i].attachment.payload.elements[j].subtitle,
                      description: rc.replies[i].attachment.payload.elements[j].subtitle,
                      picurl:  rc.replies[i].attachment.payload.elements[j].image_url,
                      url: 'https://www.dropbox.com/s/p1alo8foxwrjq1n/makeup.html?dl=0'
                    });
                }
                else if(rc.replies[i].attachment.payload.elements[j].title && !rc.replies[i].attachment.payload.elements[j].subtitle)
                {
                    if (rc.replies[i].attachment.payload.elements[j].default_action) {
                      url = rc.replies[i].attachment.payload.elements[j].default_action.url;
                    }
                    list.push({
                      title: rc.replies[i].attachment.payload.elements[j].title,
                      //description: rc.replies[i].attachment.payload.elements[j].subtitle,
                      picurl:  rc.replies[i].attachment.payload.elements[j].image_url,
                      url: 'https://www.dropbox.com/s/p1alo8foxwrjq1n/makeup.html?dl=0'
                    });
                }
             }
        }
    }
    console.log(list);
    
    res.reply(list);
    
  });
  console.log(res);
 
  return res.send();
})));
app.listen(8080);
