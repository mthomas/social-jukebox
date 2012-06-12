API = {};

API.poll = function (callback) {
    $.getJSON(API_URL + '/queue', callback);

    var songs = {
                  "queue": [
                    {
                      "duration": 187,
                      "artistName": "Neil Young",
                      "votes": 1,
                      "trackName": "kgldsfgskdl fglksdf klgsdfkm sdklfgsdklfg klsdf",
                      "submittedBy": "18184147770",
                      "rdioKey": "t1245923",
                      "sortOrder": 20,
                      "id": 42,
                      "icon": "http://cdn3.rd.io/album/5/b/f/0000000000018fb5/square-200.jpg"
                    },
                    {
                      "duration": 231,
                      "artistName": "David Bowie",
                      "votes": 1,
                      "trackName": "Life On Mars? (1999 Digital Remaster)",
                      "submittedBy": "+18184147770",
                      "rdioKey": "t2411302",
                      "sortOrder": 21,
                      "id": 43,
                      "icon": "http://cdn3.rd.io/album/1/7/e/0000000000030e71/square-200.jpg"
                    },
                    {
                      "duration": 245,
                      "artistName": "Gotye",
                      "votes": 1,
                      "trackName": "Somebody That I Used To Know",
                      "submittedBy": "system",
                      "rdioKey": "t15061212",
                      "sortOrder": 23,
                      "id": 44,
                      "icon": "http://cdn3.rd.io/album/6/a/0/00000000001440a6/square-200.jpg"
                    },
                    {
                      "duration": 198,
                      "artistName": "The Wanted",
                      "votes": 1,
                      "trackName": "Glad You Came",
                      "submittedBy": "system",
                      "rdioKey": "t12204522",
                      "sortOrder": 23,
                      "id": 45,
                      "icon": "http://cdn3.rd.io/album/7/3/a/0000000000103a37/2/square-200.jpg"
                    },
                    {
                      "duration": 219,
                      "artistName": "JAY Z & Kanye West",
                      "votes": 1,
                      "trackName": "Ni**as In Paris",
                      "submittedBy": "system",
                      "rdioKey": "t10978723",
                      "sortOrder": 23,
                      "id": 46,
                      "icon": "http://cdn3.rd.io/album/f/2/c/00000000000e5c2f/square-200.jpg"
                    },
                    {
                      "duration": 233,
                      "artistName": "Flo Rida",
                      "votes": 1,
                      "trackName": "Wild Ones (feat. Sia)",
                      "submittedBy": "system",
                      "rdioKey": "t14117474",
                      "sortOrder": 23,
                      "id": 47,
                      "icon": "http://cdn3.rd.io/album/3/f/3/000000000012f3f3/square-200.jpg"
                    },
                    {
                      "duration": 250,
                      "artistName": "fun.",
                      "votes": 1,
                      "trackName": "We Are Young (feat. Janelle Mon\u00e1e)",
                      "submittedBy": "system",
                      "rdioKey": "t11460872",
                      "sortOrder": 23,
                      "id": 48,
                      "icon": "http://cdn3.rd.io/album/6/0/c/00000000000f0c06/2/square-200.jpg"
                    },
                    {
                      "duration": 193,
                      "artistName": "Carly Rae Jepsen",
                      "votes": 1,
                      "trackName": "Call Me Maybe",
                      "submittedBy": "system",
                      "rdioKey": "t15832423",
                      "sortOrder": 23,
                      "id": 49,
                      "icon": "http://cdn3.rd.io/album/2/8/c/0000000000157c82/square-200.jpg"
                    },
                    {
                      "duration": 210,
                      "artistName": "Nicki Minaj",
                      "votes": 1,
                      "trackName": "Starships",
                      "submittedBy": "system",
                      "rdioKey": "t15750029",
                      "sortOrder": 23,
                      "id": 50,
                      "icon": "http://cdn3.rd.io/album/8/6/c/0000000000155c68/square-200.jpg"
                    },
                    {
                      "duration": 209,
                      "artistName": "Bob Seger & The Silver Bullet Band",
                      "votes": 1,
                      "trackName": "The Little Drummer Boy",
                      "submittedBy": "system",
                      "rdioKey": "t3075791",
                      "sortOrder": 23,
                      "id": 51,
                      "icon": "http://cdn3.rd.io/album/7/d/5/000000000003d5d7/square-200.jpg"
                    }
                  ]
                };
    //callback(songs);
};

API.play = function (id) {
    $.getJSON(API_URL + '/playing/' + id, function () {});
};

API.getPlaybackToken = function (callback) {
    $.getJSON(API_URL + '/token', callback);
};

