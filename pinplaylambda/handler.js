'use strict';
const AWS = require('aws-sdk');
//AWS.config.region = 'eu-west-2';
var lambda = new AWS.Lambda();
var ExifImage = require('exif').ExifImage;
var request = require('request');
var s3 = new AWS.S3();
var Spotify = require("./Spotify");

module.exports.pinplay = async event =>{ 
  console.log("event",event); 
    const {image,token,filename} = JSON.parse(event.body); 
    var binary = Buffer.from(image,"base64");  
    var option = {image:binary};
    console.log("option", option);
    var spf = new Spotify({accessToken:token});

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
                 
       const {gps,exif} = returndata;
       console.log("gps",gps);
        var country = await getCountry(gps.GPSLatitude,gps.GPSLongitude);
        var pais =country[0].short_name;
        console.log("country", pais);        
        var re = await getMusic(pais);
        re= JSON.parse(re);
        console.log("from s3",re);
        console.log("exif",exif.CreateDate);
        exportS3(image);
        await callLambda();
        var playlist = await spf.createPlaylist({name:"test_solo", description:"integration"})
        var rde = re.slice(0,5).map(r=> {
          var url_id = r.URL.split("/");
          return url_id[url_id.length-1]; 

        })
        console.log("re",rde);
        await spf.addTrackToPlaylist(rde,playlist.id);
        var spfPlay = await spf.getPlaylist(playlist.id);

        var result = {
          playlists: [{
            id: playlist.id,
            image: image,
            name: 'test_solo',
            tracks: spfPlay.tracks.items.map(s => {
              return {
                name: s.track.name,
                artist: s.track.artists[0].name,
                uri: s.track.uri,
                image: s.track.album.images[1]
              }
            })
          }]
        }

        
        
      return {
        statusCode: 200,
        body: JSON.stringify(result,
        // body: JSON.stringify(
        // {
        //   playlists : [{ "id": "6uKHB0NkmODo6XPJ0qZzpa","image": "base64","name": "Play list #1","tracks":[{ "name": "Pegando o Ônibus", "artist": "Musical JM", "uri": "spotify:track:10btUp6G91GD3bVCutBbhY", "image": "https://i.scdn.co/image/ab67616d00001e02914e545da2ce54d90a4c6423"},{ "name": "Rainha Musical","artist": "Pétalas de Prata", "uri": "spotify:track:5frPmHf7TDsPchym9wnbE9", "image": "https://i.scdn.co/image/ab67616d00001e02914e545da2ce54d90a4c6423"	},{ "name": "San Marino",  "artist": "Página Virada",  "uri": "spotify:track:5RZLUJaqCJ6vxqdZSj3rSP",  "image": "https://i.scdn.co/image/ab67616d00001e02914e545da2ce54d90a4c6423"}	] }]
          
        // },
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
async function exportS3(image) {
  let decodedImage = Buffer.from(image, "base64");
  var filePath = "tempavatar.jpg";
  var params = {
    Body: decodedImage,
    Bucket: "pinplay-images",
    Key: filePath
  };
  s3.upload(params, function(err, data) {
    // if (err) {
    //   callback(err, null);
    // } else {
    //   let response = {
    //     statusCode: 200,
    //     headers: {
    //       my_header: "my_value"
    //     },
    //     body: JSON.stringify(data),
    //     isBase64Encoded: false
    //   };
    //   callback(null, response);
    // }
  });
}

function DECtoDMS(a)
{
  return a[0] + '.' + a[1].toString().replace(/\D/, '') + a[2].toString().replace(/\D/, '');
}

async function callLambda() {
  var params = {
    FunctionName: "pinplay-imageprocessing", // the lambda function we are going to invoke
    InvocationType: "RequestResponse",
    LogType: "Tail",
    Payload: '{ "bucket" : "pinplay-images", "key":"tempavatar.jpg"}'
  };
  return new Promise((resolve, reject) => { 
    lambda.invoke(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        var resp =data.Payload;
        console.log("lambda", resp);
        resolve(resp);
      }
    });
  });
}

async function getMusic(iso) {
  var key = `regional-${iso.toLowerCase()}-weekly-latest.json`;
  console.log("paht",key);
  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket: "pinplay-music", Key: key }, function(err, data) {
      if (err) {
        console.log("eeor getting s3 image");
        reject(err);
      } else {
        console.log("s3 image", data.Body);
        var buffer = Buffer.from(data.Body).toString('utf8')               
        resolve(buffer);
      }
    });
  });
}


