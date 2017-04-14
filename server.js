// FCC Image Search Abstraction Layer
// https://www.freecodecamp.com/challenges/image-search-abstraction-layer

const express = require('express');
const mongo = require('mongodb').MongoClient;
const https= require('https');

var app = express();

app.get("/", express.static("."));
app.get("/latest", (req, res) => {
    
});
app.get("/search", (req, res) => {
//    var options = {
//        hostname: 'www.googleapis.com',
//        path: '/customsearch/v1' + '?key=AIzaSyDDeNBdKzSvils6C0qKgo6uUnNVUxSXA60&cx=012349151313725115510:nzu64kxt1ok&q=beer',
//        method: 'GET'
//    }
    var getPath = "https://www.googleapis.com/customsearch/v1?key=AIzaSyDDeNBdKzSvils6C0qKgo6uUnNVUxSXA60&cx=012349151313725115510:nzu64kxt1ok&q=beer"
    var request = https.get(getPath, (response) => {

        var body = ''
 
        response.on('data', (d) => {
//            console.log("data");
            body += d
        });
        
        response.on('end', (d) => {
//            console.log('end')
            var jbody = JSON.parse(body.toString())
//            console.log(jbody.items[0].title)
//            console.log(jbody);
            var responseArr  = []
            jbody.items.forEach( (image, i) => {
                //console.log('newline');
                //console.log(image.pagemap.imageobject[0]);
                var singleResponse = { page_url: image.link, snippet: image.snippet, image_url: ((typeof image.pagemap.imageobject[0].contenturl === "undefined") ? image.pagemap.imageobject[0].url : image.pagemap.imageobject[0].contenturl) }
                console.log(singleResponse);
            }) 
        })
    });
    
    request.on('error', (e) => {
        console.error(e);
});

});


app.listen(process.env.PORT || 3000 || 8080);