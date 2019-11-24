'use strict';
const AWS = require('aws-sdk');
const exiftool = require('node-exiftool');
const ep = new exiftool.ExiftoolProcess();
const BinaryFile = require('binary-file');
var ExifImage = require('exif').ExifImage;
var request = require('request');
var playlists;
var failure;
var s3 = new AWS.S3();

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
      console.log("returndata", returndata);              
       const {gps,exif} = returndata;
       console.log("gps",gps);
        var country = await getCountry(gps.GPSLatitude,gps.GPSLongitude);
        console.log("country", country);        
        console.log("exif",exif.CreateDate);
        exportS3(image);
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
  return new Promise((resolve, reject) => {
    new ExifImage(option, function(error, exifData) {
      if (error) {
        console.log("error ", error);
        reject(error);
      } else {
        console.log("exifData ", exifData);
        resolve(exifData);
      }
    });
  });
} 


async function getCountry(latitude,longitude){ 
  return new Promise((resolve, reject) => {
    console.log("latlng",latitude+longitude);
    latitude = DECtoDMS(latitude);
    
    longitude = DECtoDMS(longitude);
    console.log("DECtoDMS",latitude+longitude);
    request("https://maps.googleapis.com/maps/api/geocode/json?latlng="+latitude+","+longitude+"&key=AIzaSyBBlERNMHhV5pwkfMwfXlBIOEFvmEGoz64", function (error, response, body) {
      if(error){
        console.log('error:', error); // Print the error if one occurred
        reject(error);
      }
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received     
      console.log('body:', body); // Print the HTML for the Google homepage.
      const {results} = JSON.parse(body);
      var country = results[0].address_components.filter((item)=>item.types.includes("country"));
      resolve(country); 
    });
  });
  
}

function DECtoDMS(a)
{
  return a[0] + '.' + a[1].toString().replace(/\D/, '') + a[2].toString().replace(/\D/, '');
}


function exportS3(image) {
  let decodedImage = Buffer.from(image, "base64");
  var filePath = "avatars/tempavatar.jpg";
  var params = {
    Body: decodedImage,
    Bucket: "pinplay-images",
    Key: filePath
  };
  s3.upload(params, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
      let response = {
        statusCode: 200,
        headers: {
          my_header: "my_value"
        },
        body: JSON.stringify(data),
        isBase64Encoded: false
      };
      callback(null, response);
    }
  });
}



