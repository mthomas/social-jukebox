import os
import psycopg2
import psycopg2.extras 
import dj_database_url
import requests
import datetime
import json
import oauth2 as oauth
import urllib
import random
import time
import md5
import re

from bs4 import BeautifulSoup, Comment
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, jsonify
from twilio.rest import TwilioRestClient
from xml.dom import minidom
import bottlenose

from config import ADMIN_NUMBERS, DATABASE_URL, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER, RDIO_KEY, RDIO_SECRET, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_AFFILIATE_CODE, TUMBLR_EMAIL, TUMBLR_PASS, ROVI_KEY, ROVI_SECRET, SENDGRID_USER, SENDGRID_KEY, SENDGRID_FROM, DOMAIN, SPIRE_SECRET

LYRIC_URL = "http://lyrics.wikia.com/api.php"
TWILIO_SEND_URL = "https://api.twilio.com/2010-04-01/Accounts/%s/SMS/Messages" % TWILIO_ACCOUNT_SID

try:
    amazon = bottlenose.Amazon(AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_AFFILIATE_CODE)
except:
    print "Unable to connect to Amazon"

try:
    dbparameters = dj_database_url.config(default=DATABASE_URL)
    conn = psycopg2.connect(database=dbparameters["NAME"], user=dbparameters["USER"], password=dbparameters["PASSWORD"], host=dbparameters["HOST"], port=dbparameters["PORT"])
except:
    print 'Unable to connect to Database'

app = Flask(__name__)

def is_admin(from_number):
    for number in ADMIN_NUMBERS:
        if from_number.find(number) > -1:
            return True

    return False

def set_config(name, value):
    cursor = conn.cursor()
    cursor.execute("delete from Config where name=%s", (name,))
    cursor.execute("insert into Config(name, value) values(%s, %s)", (name, value))
    cursor.close()
    conn.commit()

def get_config(name=None):
    cursor = conn.cursor()

    if name == None:
        cursor.execute("select name, value from Config")
        rows = cursor.fetchall()

        d = {}

        for row in rows:
            d[row[0]] = row[1]
        
        cursor.close()

        return d
    else:
        cursor.execute("select value from Config where name=%s", (name, ))
        row = cursor.fetchone()
        cursor.close()

        if row == None:
            return None
        else:
            return row[0]

def get_album(key):
    consumer = oauth.Consumer(RDIO_KEY, RDIO_SECRET)
    client = oauth.Client(consumer)
    response = client.request('http://api.rdio.com/1/', 'POST', urllib.urlencode({'method': 'get', "keys":key}))

    data = json.loads(response[1])

    return data["result"][key]["album"]

def get_album_info(track):
    if ROVI_KEY == None:
        return

    album = get_album(track["rdio_key"])
    info = {"name":album}

    tohash = "%s%s%s" % (ROVI_KEY, ROVI_SECRET, int(time.time()))
    sig = md5.new(tohash).hexdigest()

    args = {"album":album,"apikey":ROVI_KEY,"sig":sig}
    url = "http://api.rovicorp.com/data/v1/album/info?%s" % urllib.urlencode(args)

    r = requests.get(url)

    data = json.loads(r.text)

    if data["album"] == None:
        return info

    if data["album"].get("headlineReview", None) != None:
        info["review"] = data["album"]["headlineReview"]["text"]
    
    return info

def get_html_album_info(track):
    try:
        info = get_album_info(track)


        text = "<h2>%s by %s</h2>" % (info["name"], track["artist_name"])

        if info.get("review", None) != None:
            text += "<p>%s</p>" % info["review"]

        return text

    except Exception as e:
        print e
        return ""

def post_to_tumblr(title, body):
    if TUMBLR_EMAIL == None:
        return

    data = {"email":TUMBLR_EMAIL, "password":TUMBLR_PASS,"type":"regular", "title":title, "body":body}
    r = requests.post("http://www.tumblr.com/api/write", data=data)

    print "TUMBLR RESPONSE"
    print r.status_code
    print r.text

def find_product(artist, track):
    if AWS_ACCESS_KEY == None:
        return None

    try:
        text = amazon.ItemSearch(SearchIndex="MP3Downloads", Keywords="%s %s" % (artist, track))
        dom = minidom.parseString(text)
        items = dom.getElementsByTagName("Item")

        if len(items) == 0:
            return None

        return {
            "title":get_prop(items[0], "Title"),
            "artist":artist,
            "track":track,
            "url": "http://www.amazon.com/dp/%s" % get_prop(items[0], "ASIN")
        }
    except Exception as e:
        print "ERROR"
        print e
        return None

def get_prop(item, prop):
    try:
        return item.getElementsByTagName(prop)[0].childNodes[0].data
    except:
        return None

def get_queue():
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("select * from Queue order by sort_order asc")
    rows = cur.fetchall()
    return rows

def get_now_playing(id = None):
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    if id == None:
        cur.execute("select * from NowPlaying order by id desc limit 1")
    else:
        cur.execute("select * from NowPlaying where id = %s", (id, ))
    track = cur.fetchone()
    return track

def get_lyrics(artist, track):
    cur = conn.cursor()
    cur.execute("select lyrics from Lyrics where artist=%s and song=%s", (artist, track))
    lyric = cur.fetchone()
    if lyric != None:
        print "LRYICS CAME FROM DB CACHE"
        return lyric[0]

    args = {"artist": artist, "song": track, "fmt": "xml"}
    r = requests.get(LYRIC_URL + "?" + urllib.urlencode(args))
    
    try:
        dom = minidom.parseString(r.text.encode("utf-8"))
        el = dom.getElementsByTagName("url")[0]
        page = requests.get(el.childNodes[0].data)
        soup = BeautifulSoup(page.text)
        comments = soup.findAll(text=lambda text:isinstance(text, Comment))
        [comment.extract() for comment in comments]
        lyrics = "<br/>".join([c for c in soup.find("div", { "class" : "lyricbox" }).children if not hasattr(c, "name")])

        cur.execute("insert into Lyrics(artist, song, lyrics) values (%s, %s, %s)", (artist, track, lyrics))
        cur.close()
        conn.commit()

        print "LYRICS CAME FROM WEB"
        return lyrics
    except Exception as e:
        print e
        return ""
 
def send_sms(to, body):
    if to == "system":
        return

    if to.find("@") != -1:
        args = {"to":to, "from":SENDGRID_FROM, "subject":body, "text":body,
            "api_user":SENDGRID_USER, "api_key":SENDGRID_KEY, "fromname":"Social Jukebox"}
        r = requests.post("https://sendgrid.com/api/mail.send.json", data=args)

        print r.text
    else:
        args = {"From":TWILIO_NUMBER, "To":to, "Body":body}
        response = requests.post(TWILIO_SEND_URL, data=args, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN))
        print response.text

def remove_track(from_number):
    cur = conn.cursor()
    cur.execute("delete from Queue where id = (select max(id) as id from Queue where submitted_by=%s)", (from_number, ))
    cur.close()
    conn.commit()

    send_sms(from_number, "Done -- that song is gone!")

def vote_track(from_number, queue_id):
    cur = conn.cursor()
    cur.execute("select * from Vote where submitted_by=%s and queue_id=%s", (from_number, queue_id))
    rows = cur.fetchall()

    if(len(rows) > 0):
        print "already voted"
        send_sms(from_number, "We know! You love that one!")
        return

    cur.execute("insert into Vote(submitted_by, queue_id) values(%s, %s)", (from_number, queue_id))
    cur.execute("update Queue set sort_order = sort_order - 2, votes = votes + 1 where id = %s", (queue_id, ))
    cur.execute("select track_name from Queue where id=%s", (queue_id, ))
    rows = cur.fetchall()

    cur.close()
    conn.commit()

    send_sms(from_number, "Got it. You've promoted %s" % rows[0][0])

def autocorrect(q):
    print "auto correcting %s" % q

    try:
        args = {"sourceid":"chrome", "ie":"UTF-8", "q":q}
        r = requests.get("https://www.google.com/search?" + urllib.urlencode(args))
        soup = BeautifulSoup(r.text)

        els = [d for d in soup.descendants if hasattr(d, "text") and d.text != None and d.text.find("Showing results for") != -1]

        if len(els) == 0:
            return q
        else:
            return els[-1].find("a").text
    except Exception as e:
        print e
        print "Failed auto correction"
        return q

def get_top(count=5, genre="all"):
    if genre == "all":
        consumer = oauth.Consumer(RDIO_KEY, RDIO_SECRET)
        client = oauth.Client(consumer)
        response = client.request('http://api.rdio.com/1/', 'POST', urllib.urlencode({'method': 'getTopCharts', "type":"Track"}))

        items = json.loads(response[1])["result"]

        if len(items) > count:
            return random.sample(items, count)
        else:
            return items
    else:
        if genre.lower() == "rock":
            genre = "Rock & Roll"

        page = random.randint(1, 4)
        r = requests.get("http://ws.spotify.com/search/1/track.json?" + urllib.urlencode({"q": "genre:\"%s\"" % genre, "page":page }))
        print r.text
        data = json.loads(r.text)
        ids = [t["external-ids"][0]["id"] for t in data["tracks"]]
        random.shuffle(ids)

        tracks = []

        for id in ids:
            consumer = oauth.Consumer(RDIO_KEY, RDIO_SECRET)
            client = oauth.Client(consumer)
            response = client.request('http://api.rdio.com/1/', 'POST', urllib.urlencode({'method': 'getTracksByISRC', "isrc":id}))
            try:
                tracks.append(json.loads(response[1])["result"][0])
            except:
                print "failed to parser response"

            if len(tracks) == count:
                return tracks

        return tracks


def search(q):
    print "Searching for %s" % q
    q = autocorrect(q)
    print "Corrected search %s" % q

    #TODO detect if is artist search and return more diversity

    r = requests.get("http://ws.spotify.com/search/1/track.json?" + urllib.urlencode({"q": q}))
    data = json.loads(r.text)

    ids = [t["external-ids"][0]["id"] for t in data["tracks"]][0:10]

    artist = data["tracks"][0]["artists"][0]["name"]
    is_artist = True

    for part in q.split(" "):
        if artist.lower().find(part.lower()) == -1:
            is_artist = False

    print "PRE IDS"
    print ids

    if is_artist:
        print "artist query -- picking top 10"
        random.shuffle(ids)
        print "POST IDS"
        print ids

    for id in ids:
        consumer = oauth.Consumer(RDIO_KEY, RDIO_SECRET)
        client = oauth.Client(consumer)
        response = client.request('http://api.rdio.com/1/', 'POST', urllib.urlencode({'method': 'getTracksByISRC', "isrc":id}))
        try:
            print response[1]
            data = json.loads(response[1])["result"][0]
            return data
        except:
            print "failed to parser response"

    return None

def get_artist(key):
    print "GET ARTIST %s" % key
    consumer = oauth.Consumer(RDIO_KEY, RDIO_SECRET)
    client = oauth.Client(consumer)
    response = client.request('http://api.rdio.com/1/', 'POST', urllib.urlencode({'method': 'get', "keys":key}))
    print response[1]
    data = json.loads(response[1])["result"][key]
    return data

RICK_ROLL = [
    "We're no strangers to love",
    "You know the rules and so do I",
    "A full commitment's what I'm thinking of",
    "You wouldn't get this from any other guy",
    "I just wanna tell you how I'm feeling",
    "Gotta make you understand",

    "Never gonna give you up",
    "Never gonna let you down",
    "Never gonna run around and desert you",
    "Never gonna make you cry",
    "Never gonna say goodbye",
    "Never gonna tell a lie and hurt you",
]

def get_sort_order(submitted_by):
    cur = conn.cursor()

    if submitted_by == "system":
        cur.execute("select max(sort_order) as sort_order from Queue")
    else:
        cur.execute("select max(sort_order) as sort_order from Queue where submitted_by != 'system'")

    sort_order = 1

    rows = cur.fetchall()

    if(len(rows) > 0 and len(rows[0]) > 0 and rows[0][0] != None):
        sort_order = rows[0][0] + 1

    cur.close()

    return sort_order

def insert_track(submitted_by, track):
    artist = get_artist(track["artistKey"])

    if artist["name"].lower().find("rick") != -1 and artist["name"].lower().find("astley") != -1:
        send_sms(submitted_by, "You really thought I would let you get away with that??")
        for line in RICK_ROLL:
            send_sms(submitted_by, line)

        return

    sort_order = get_sort_order(submitted_by)

    args = (sort_order, track["key"], track["name"], artist["name"], track["duration"], track["icon"], submitted_by, datetime.datetime.now())
    print "INSERT WITH ARGS"
    print args

    cur = conn.cursor()
    cur.execute("insert into Queue(sort_order, rdio_key, track_name, artist_name, duration, icon, submitted_by, created, votes) values (%s, %s, %s, %s, %s, %s, %s, %s, 1) returning id", args)
    queue_id = cur.fetchone()[0]
    cur.execute("insert into Vote(submitted_by, queue_id) values(%s, %s)", (submitted_by, queue_id))
    cur.close()
    conn.commit()

    
    send_sms(submitted_by, "Got it! We queued %s by %s. Send 'oops' to remove!" % (track["name"], artist["name"]))

def buy_playing(from_number):
    track = get_now_playing()

    if track == None:
        send_sms(from_number, "You can't buy a song that isn't playing :)")
        return

    item = find_product(track["artist_name"], track["track_name"])

    if item == None:
        send_sms(from_number, "Sorry but we can't find %s." % track["track_name"])
        return

    send_sms(from_number, "Buy %s: %s" % (item["title"], item["url"]))

def clear_playlist(from_number):
    if not is_admin(from_number):
        send_sms(from_number, "Only admins can clear the queue.")
        return

    cur = conn.cursor()
    cur.execute("delete from Queue")
    cur.close()
    conn.commit()
    send_sms(from_number, "Queue cleared.")

def change_channel(from_number, parsed_commands):
    if not is_admin(from_number):
        send_sms(from_number, "Only admins can clear the queue.")
        return

    channel = " ".join(parsed_commands[1:])

    set_config("channel", channel)
    send_sms(from_number, "Channel changed to %s" % channel)

def parse_from(from_field):
    if from_field.find("<") > -1:
        return re.search("\<(.*)\>", from_field).group(1)

    return from_field

@app.route("/search")
def search_action():
    q = request.args["q"]
    return jsonify(track = search(q))

def handle_command(from_number, body):
    print "Got command %s from %s" % (body, from_number)
    commands = body.lower().split(' ')
    command = commands[0]
    iscommand = len(commands) == 1

    if(command == "oops" and len(body) <= 7):
        remove_track(from_number)
    elif((command == "vote" or command == "promote")and len(commands) == 2):
        vote_track(from_number, body.split(" ")[1])
    elif((command == "playing" or command == "song") and iscommand):
        track = get_now_playing()
        if track == None:
            send_sms(from_number, "The jukebox is silent.")
        else:
            send_sms(from_number, "Now playing %s by %s." % (track["track_name"], track["artist_name"]))
    elif(command == "lyrics" and iscommand):
        track = get_now_playing()
        if track == None:
            send_sms(from_number, "The jukebox is silent.")
        else:
            send_sms(from_number, "Sing along with %s here: http://hhd-juke.herokuapp.com/lyrics/%s" % (track["track_name"], track["id"]))
    elif((command == "queue" or command == "playlist") and iscommand):
        queue = get_queue()[0:5]
        text = ", ".join(["#%s %s" % (track["id"], track["track_name"]) for track in queue])
        
        if len(text) > 160:
            text = text[0:155] + "..."

        send_sms(from_number, "Up next: " + text)
    elif(command=="buy" and iscommand):
        buy_playing(from_number)
    elif(command=="!clear" and iscommand):
        clear_playlist(from_number)
    elif(command=="!channel"):
        change_channel(from_number, commands)
    else:
        track = search(body)

        if(track != None):
            print "found tracks"
            insert_track(from_number, track)
            return jsonify(track=track)
        else:
            print "found none"
            return jsonify(track=None)

    return jsonify(success=True)


@app.route("/sms")
def sms():
    body = request.args["Body"]
    from_number = request.args["From"]

    return handle_command(from_number, body)

@app.route("/lyrics/<id>")
def lyrics(id):
    track = get_now_playing(id)

    if track == None:
        return "Not found!"

    lyrics = get_lyrics(track["artist_name"], track["track_name"])

    return render_template("lyrics.html", track=track, lyrics=lyrics)

@app.route("/nowplaying")
def nowplaying():
    track = get_now_playing()
    track["created"] = None
    track = dict(track)
    return jsonify(track)

@app.route("/playing/<id>", methods=['GET', 'POST'])
def playing(id):
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute("select * from Queue where id=%s", (id, ))
    track = cur.fetchone()

    if(track == None):
        return jsonify(success=False)

    args = (track["rdio_key"], track["track_name"], track["artist_name"], track["duration"], track["icon"], track["submitted_by"], datetime.datetime.now())
    cur.execute("insert into NowPlaying(rdio_key, track_name, artist_name, duration, icon, submitted_by, created) values (%s, %s, %s, %s, %s, %s, %s)", args)
    cur.execute("delete from Queue where id=%s", (id, ))
    cur.close()
    conn.commit()

    product = find_product(track["artist_name"], track["track_name"])

    body = get_html_album_info(track)

    body += "<div><img src='%s' /></div>" % track["icon"]

    if product != None:
        body += "<div style='font-size: 20px; margin-top:20px'><a href='%s' target='_blank'>DIGITAL DOWNLOAD ON AMAZON</a></div>" % product["url"]

    lyrics = get_lyrics(track["artist_name"], track["track_name"])

    if lyrics != None:
        body += "<div style='margin-top: 20px'>%s</div>" % lyrics

    post_to_tumblr("NOW PLAYING: %s by %s" % (track["track_name"], track["artist_name"]), body)

    return jsonify(success=True, id=id)

@app.route("/queue")
def queue():
    rows = get_queue()
    minsongs = 10

    if len(rows) < minsongs:
        channel = get_config("channel")
        if channel != None and channel != "none":
            more = get_top(minsongs - len(rows), channel)

            for item in more:
                insert_track("system", item)

            rows = get_queue()

    queue = [{"id": row["id"], "rdioKey": row["rdio_key"], "trackName": row["track_name"], 
        "duration": row["duration"], "artistName": row["artist_name"], "icon": row["icon"],
        "votes": row["votes"], "sortOrder": row["sort_order"],
        "submittedBy": row["submitted_by"]} for row in rows]

    return jsonify(queue=queue)

@app.route("/token")
def token():
    consumer = oauth.Consumer(RDIO_KEY, RDIO_SECRET)
    client = oauth.Client(consumer)
    params = {'method': 'getPlaybackToken', "domain":DOMAIN}
    response = client.request('http://api.rdio.com/1/', 'POST', urllib.urlencode(params))
    print json.loads(response[1])["result"]
    return jsonify(token=json.loads(response[1])["result"])

@app.route('/')
def index():
    return render_template("index.html", SPIRE_SECRET=SPIRE_SECRET, DOMAIN=DOMAIN)

@app.route('/remote')
def remote():
    return render_template("remote.html", SPIRE_SECRET=SPIRE_SECRET, DOMAIN=DOMAIN)

@app.route('/email',methods=['POST', 'GET'])
def email():
    from_address = parse_from(request.form["from"])
    to_address = request.form["to"]
    subject = request.form["subject"]

    print "%s sent %s"  % (from_address, subject)

    return handle_command(from_address, subject)

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.debug = False
    app.run(host='0.0.0.0', port=port)