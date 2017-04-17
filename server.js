// FCC Image Search Abstraction Layer
// https://www.freecodecamp.com/challenges/image-search-abstraction-layer

const express = require('express');
const mongo = require('mongodb').MongoClient;
const https= require('https');

var app = express();

const mongoURL = "mongodb://dbrainzfcc:isearch@ds161580.mlab.com:61580/imagesearch"

app.get("/", express.static("."));
app.get("/latest", (req, res) => {
    mongo.connect(mongoURL, (err,db) => {
        if (err) throw err;
        var log = db.collection("search_log");
        log.find({}, { _id: 0, search_terms: 1, offset: 1, timestamp: 1}).toArray( (err, data) => {
            if (err) throw err;
            res.end(JSON.stringify(data))
        })
    })
});
app.get("/search/:searchterm", (req, res) => {

    var searchTerms = req.params.searchterm
    var startRec = 1
    if (req.query.offset != {}) {
        if (req.query.offset > 91) {
            res.end(JSON.stringify({error : "Offset must be less than 92"}))
            return;
        }
        else {
            startRec = req.query.offset
        }
    };

    var getPath = "https://www.googleapis.com/customsearch/v1?key=AIzaSyDDeNBdKzSvils6C0qKgo6uUnNVUxSXA60&cx=012349151313725115510:nzu64kxt1ok&q=" + searchTerms + "&start=" + startRec
    var request = https.get(getPath, (response) => {

        var body = ''
 
        response.on('data', (d) => {
            body += d
        });
        
        response.on('end', (d) => {
            var jbody = JSON.parse(body.toString());
            var responseArr  = [];
            jbody.items.forEach( (image, i) => {
                var imageUrl = "";
                if (typeof image.pagemap.imageobject[0].url != "undefined") {
                    imageUrl = image.pagemap.imageobject[0].url;
                }
                else if (typeof image.pagemap.imageobject[0].contenturl != "undefined") {
                    imageUrl = image.pagemap.imageobject[0].contenturl;
                }
                else if (typeof image.pagemap.imageobject[0].image != "undefined") {
                    imageUrl = image.pagemap.imageobject[0].image;
                }
                else {    
                    imageUrl = image.pagemap.imageobject[0].thumbnailurl;
                }
                var singleResponse = { page_url: image.link, snippet: image.snippet, image_url: imageUrl }
                responseArr.push(singleResponse);
            })
            res.end(JSON.stringify(responseArr));
            
            mongo.connect(mongoURL, (err, db) => {
                if (err) throw err;
                var log = db.collection('search_log');
// I tried to use .findAndModify here - but was unable to get it to delete
// the record - after much experimentation I gave up for now and instead 
// inserted a separate .find and a .remove to achieve the same thing
                log.find().toArray( (err, data) => {
                    if (err) throw err;
                    log.remove({_id : data[0]._id})
                })
                
                var insertRec = { 'search_terms' : searchTerms, 'offset' : startRec, 'timestamp' : Date.now() }
                log.insert(insertRec, (err, data) => {
                    if (err) throw err;
                })
                
            })
        })
    });
    
    request.on('error', (e) => {
        console.error(e);
});

});


app.listen(process.env.PORT || 3000 || 8080);