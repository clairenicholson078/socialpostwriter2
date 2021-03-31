
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cheerio = require('cheerio');
const ejs = require('ejs');


const fs = require('fs');
const writeStream = fs.createWriteStream('posts.csv');


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

let pageText;
let paraText;


app.get('/', function(req, res){
    res.render('generate');
})

app.get('/generate', function(req, res){
    res.render('generate');
});

app.post('/generate', function(req, res){

    let url = req.body.url; // get url from form
    let selection = req.body.selection;
    pageText = [];
    paraText = [];
    
    //process data on html page

    request(url, function (error, response, body) {

        if(!error && response.statusCode === 200){

        const $ = cheerio.load(body); //load the html page into Cheerio

        if (selection === 'getSentences'){ //Get Sentences from Blog Posts
            
        let regex = /["']?[A-Z][^.?!]+((?![.?!]['"]?\s["']?[A-Z][^.?!]).)+[.?!'"]+/g; 
        
        const paragraphs =  $('p');
        
        paragraphs.each(function(index, element){
            const sentence = $(this).text();

            if (sentence.match(regex)){
                if (sentence.startsWith('<')){
                    pageText.slice(index, 1);
                } else {
                    pageText.push(sentence.trim());
                }
            } 
        });
        
        pageText.forEach(function(sentence){
            writeStream.write(`${sentence}\n`);
        });
        
        res.redirect('/sentences');
        
        } else if (selection === 'getParagraphs'){ //Get Paragraphs from Blog Posts
            
            //let regex = /["']?[A-Z][^.?!]+((?![.?!]['"]?\s["']?[A-Z][^.?!]).)+[.?!'"]+/g; 
            
            const paragraphs =  $('p');
            
            paragraphs.each(function(index, element){
                const sentence = $(this).text();
    
                
                    if (sentence.startsWith('<')){
                        paraText.slice(index, 1);
                    } else {
                        paraText.push(sentence.trim());
                    }
                
            });
            
            paraText.forEach(function(sentence){
                writeStream.write(`${sentence}|\n`);
            });
            
            res.redirect('/paragraphs');
            } else {
         console.log(error); 
         res.redirect('/'); 
        }// end else-if statement

        
    } //end if request error handling 
    }); // end request
    
}); //end app.post

app.get('/sentences', function(req, res){
    
    res.render('results-sentences', {paragraphs: pageText});
});

app.get('/paragraphs', function(req, res){
    
    res.render('results-paragraphs', {paragraphs: paraText});
});

app.get('/download', function(req, res){
    res.download(__dirname + '/posts.csv');
});

app.get('/import-guide', function(req, res){
    res.render('import-guide');
})

app.listen(process.env.PORT || 3000, function(){
    console.log('Server started on port 3000.');
})