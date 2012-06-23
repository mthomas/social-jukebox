Social Jukebox allows you to send song requests in via SMS.  The songs are then played through the web front end.  


h1. Installation

Social Jukebox is designed to be hosted on Heroku.  

h2. Environment Variables

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

h2. Twilio configuration

You must provision a twilio SMS number to point to http://YOUR_DOMAIN/sms.

h2. Sendgrid configuration 

Optionally, you can configure a sendgrid email address to send to http://YOUR_DOMAIN/email.