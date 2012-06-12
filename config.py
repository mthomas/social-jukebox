import os

ADMIN_NUMBERS = os.environ.get("ADMIN_NUMBERS").split(",")

DATABASE_URL = os.environ.get(os.environ.get("DATABASE_URL_VAR"))

# To find these visit https://www.twilio.com/user/account
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_NUMBER = os.environ.get("TWILIO_NUMBER")

RDIO_KEY = os.environ.get("RDIO_KEY")
RDIO_SECRET = os.environ.get("RDIO_SECRET")


AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY")
AWS_AFFILIATE_CODE = os.environ.get("AWS_AFFILIATE_CODE")

TUMBLR_EMAIL = os.environ.get("TUMBLR_EMAIL")
TUMBLR_PASS = os.environ.get("TUMBLR_PASS")

ROVI_KEY = os.environ.get("ROVI_KEY")
ROVI_SECRET = os.environ.get("ROVI_SECRET")

SENDGRID_USER = os.environ.get("SENDGRID_USER")
SENDGRID_KEY = os.environ.get("SENDGRID_KEY")
SENDGRID_FROM = os.environ.get("SENDGRID_FROM")

DOMAIN = os.environ.get("DOMAIN")

SPIRE_SECRET = os.environ.get("SPIRE_SECRET")