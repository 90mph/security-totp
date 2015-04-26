console.log("Starting Time Based One Time Password Application");
var http = require("http");
var crypto = require('crypto');
var util = require('util');
var base32 = require('rfc-3548-b32');
var qs = require('querystring');
var speakeasy = require('speakeasy');
var secretSize = 80;
var numOfScratchCodes  = 5;
var scratchCodeSie = 10; 
var bEncodedKey;
try {
  var buffer = crypto.randomBytes(secretSize + numOfScratchCodes * scratchCodeSie);
  console.log('Have %d bytes of buffer: %s', buffer.length, buffer);
  console.log('buffer type->' + typeof buffer);
  var secretKey = buffer.slice(0, secretSize);
  console.log('secretKey length->'+secretKey.length);
  bEncodedKey = base32.encode(secretKey);
  console.log('bEncodedKey->'+bEncodedKey);
} catch (ex) {
  console.log(ex);
}
var server = http.createServer(function(req, res) {
  res.writeHead(200);
  var str = req.url.split('?')[1];
  var queryParams = qs.parse(str);
  console.log(queryParams);
  console.log('speakeasy->'+speakeasy.totp({key: base32.decode(bEncodedKey)}));
  var code = queryParams.code;
  var url = getQRBarcodeURL('varun', '90mph.in', bEncodedKey);
  var window = 100;
  var timeParam = Math.floor(new Date() / 30000);
  console.log('timeParam->'+timeParam);
  for (var j = -window; j <= window; ++j) {
	    /*var hash = verify_code(base32.decode(bEncodedKey), timeParam + j);
	    if (hash == code) {
	      console.log('***************matched');
		  return;
	    }*/
	  }
	  console.log(url);
  res.end('<img src='+url+'></img>');
});

function getQRBarcodeURL(user, host, secret){
var format = "https://www.google.com/chart?chs=200x200&chld=M%%7C0&cht=qr&chl=otpauth://totp/%s@%s%%3Fsecret%%3D%s";
	  return util.format(format, user, host, secret);
}

function verify_code (key, time){
var data = new Buffer(8);
var tempNumber;
//console.log('time >>>= 8 ->'+(time >>>= 8))
tempNumber = time >>>= 8;
for (var i = 8,k=0; i-- > 0, k++; time >>>= 8) {
		data.writeInt8(time,k);
	}
	//console.log('data->'+data);
	var hmac = crypto.createHmac('sha1', key);
	//console.log('hmac->'+hmac);
	var finalBuffer = hmac.update(new Buffer(tempNumber)).digest('hex');
	//console.log('finalBuffer->'+JSON.stringify(finalBuffer));
	var offset = finalBuffer[20 - 1] & 0xF;
	//console.log('offset->'+offset);
	var truncatedHash = 0;
	for (i = 0; i < 4; ++i) {
	    truncatedHash <<= 8;
	    // We are dealing with signed bytes:
	    // we just keep the first byte.
	    truncatedHash |= (finalBuffer[offset + i] & 0xFF);
	  }
	  truncatedHash &= 0x7FFFFFFF;
	  truncatedHash %= 1000000;
	  console.log(truncatedHash);
	  return truncatedHash;
}
server.listen(8080);