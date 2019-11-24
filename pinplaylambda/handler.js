'use strict';
const exiftool = require('node-exiftool');
const ep = new exiftool.ExiftoolProcess();
const BinaryFile = require('binary-file');
var ExifImage = require('exif').ExifImage;
var request = require('request');
var playlists;
var failure;

module.exports.pinplay = async event =>{
  console.log("event",event); 
    const {image,token} = JSON.parse(event.body); 
    var binary = Buffer.from(image,"base64");  
    var option = {image:binary};
    console.log("option", option);
    var returndata = await extractData(option);
    if(returndata === false){     
        return {
          statusCode: 500,
          body: JSON.stringify(
          {
            message: 'Failed!',             
          },
          null,
          2)
        }
    }else {
      return {
        statusCode: 200,
        body: JSON.stringify(
        {
          playlists : [{ "id": "6uKHB0NkmODo6XPJ0qZzpa","image": "base64","name": "Play list #1","tracks":[{ "name": "Pegando o Ônibus", "artist": "Musical JM", "uri": "spotify:track:10btUp6G91GD3bVCutBbhY", "image": "https://i.scdn.co/image/ab67616d00001e02914e545da2ce54d90a4c6423"},{ "name": "Rainha Musical","artist": "Pétalas de Prata", "uri": "spotify:track:5frPmHf7TDsPchym9wnbE9", "image": "https://i.scdn.co/image/ab67616d00001e02914e545da2ce54d90a4c6423"	},{ "name": "San Marino",  "artist": "Página Virada",  "uri": "spotify:track:5RZLUJaqCJ6vxqdZSj3rSP",  "image": "https://i.scdn.co/image/ab67616d00001e02914e545da2ce54d90a4c6423"}	] }]
        },
        null,
        2)
        }
    }   
       
};

async function extractData(option) {
  try {
    new ExifImage(option, function(error, exifData) {
      console.log("entrei");
      if (error)
        return Promise.resolve(false);           
        else
            return Promise.resolve(exifData);
    });
  } catch (error) {
    console.log("Catch: " + error.message);
    return Promise.resolve(false);    
  }
}

