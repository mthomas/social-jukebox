Social Jukebox allows you to send song requests in via SMS.  The songs are then played through the web front end.  

h1. Installation

Social Jukebox is designed to be hosted on Heroku.  So set up a Heroku app and a Postgers database.

You also must configure a Twilio SMS number to point to YOUR_DOMIAN/sms.

Then look in config.py and set up all the needed environment variables using "heroku config:add"

The RDIO, Twilio, database, and spire values are required.  The rest are optional.