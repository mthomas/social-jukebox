The Social Jukebox
==================

Introduction
------------

This is the 2nd prize winning 2012 Hollywood Hack Day submission!

Proudly built by:
 - Ames Bielenberg (special ops, hardware hacking, visualizations)
 - Mike Thomas (backend, api integrations, ops)
 - Vahur Roosimaa (frontend, design, relentless minimalism)

Social Jukebox allows you to send song requests in via SMS.  The songs are then played through the web front end.  

Installation
------------

Social Jukebox is designed to be hosted on Heroku.  So set up a Heroku app and a Postgers database.

You also must configure a Twilio SMS number to point to YOUR_DOMIAN/sms.

Then look in config.py and set up all the needed environment variables using "heroku config:add"

The RDIO, Twilio, database, and spire values are required.  The rest are optional.