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

Features and Design
-------------------

The Social Jukebox backend runs on a heroku cloud server.  Each installation powers a single jukebox frontend.  The frontend is generally a bigscreen TV connected to great sound system.  It is important to only connect a single frontend to a backend.  

The jukebox can then be controlled through several methods.

SMS: you can text various commands to a number to add songs to the queue, vote for existing songs, or many other features
Admin Mobile Client: administrators can use a special mobile client to pause the jukebox and skip songs.
Email: the same commands can be sent in via email.

If the queue has fewer than 5 songs in it, songs will be added from the currently selected (admin controlled) channel.

Command Reference
-----------------

SMS and Email

 - <anything not listed below>: if an artist name, add a random song of that artist to the queue.  otherwise add the best guess song to the queue.
 - oops: remove the last song that was queued by that number/email address
 - vote ###: move the song identified by the number up in the queue
 - playing: have the track info of the current song sent to you
 - lyrics: have a link to the lyrics of the song sent to you
 - queue: have a list of upcoming songs sent to you
 - buy: have a link to buy the current song sent to you

 - !clear: if the user is an admin, clear the queue
 - !channel CHANNEL: if the user is an admin, set the current channel

Installation
------------

Social Jukebox is designed to be hosted on Heroku.  It runs on a single web dynamo on a small (development) PostgreSQL database.

Environment Variables
---------------------

The following environment variables are either required or optional to the application.

Use the "heroku config:add" command to add them to a heroku environment.

If you are using foreman to run the application locally, you can set them using the .env file.

The RDIO, Twilio, database, and spire values are required.  The rest are optional.

ADMIN_NUMBERS="5553334444,6664445555"  | required
DATABASE_URL_VAR="HEROKU_POSTGRESQL_RED_URL" | required | this should be the name of the environment variable that heroku stores your connection string
DOMAIN | required | the domain of the application

TWILIO_ACCOUNT_SID | required
TWILIO_AUTH_TOKEN | required
TWILIO_NUMBER | required

RDIO_KEY | required
RDIO_SECRET | required

AWS_ACCESS_KEY | optional | used to power "buy" feature
AWS_SECRET_KEY | optional | used to power "buy" feature
AWS_AFFILIATE_CODE | optional | used to power "buy" feature

TUMBLR_EMAIL | optional | used to power auto blogging feature
TUMBLR_PASS | optional | used to power auto blogging feature

ROVI_KEY | optional | used to power auto blogging feature
ROVI_SECRET | optional | used to power auto blogging feature

SENDGRID_USER | optional | used to enable email integration
SENDGRID_KEY | optional | used to enable email integration
SENDGRID_FROM | optional | used to enable email integration

SPIRE_SECRET | required | used to power the admin remote control

Twilio configuration
--------------------

You must provision a twilio SMS number to point to http://YOUR_DOMAIN/sms.

Sendgrid configuration 
----------------------

Optionally, you can configure a sendgrid email address to send to http://YOUR_DOMAIN/email.
