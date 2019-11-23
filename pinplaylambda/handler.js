'use strict';


// module.exports.pinplay = async event => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Winner 2019 -> VAMO DALE V2!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };

module.exports.pinplay = async event =>{

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
  console.log("event",event);
  var ok = true;
  if (ok){
        return {
          statusCode: 200,
          body: JSON.stringify(
          {
            message: 'Go Serverless v1.0! Winner 2019 -> VAMO DALE V2!',
            input: event,
          },
            null,
            2)
       }   
    } 
    else {
      return {
        statusCode: 500,
        body: JSON.stringify(
        {
          message: 'Failed!',
          input: event,
        },
          null,
          2)
     }   
    }     
};

