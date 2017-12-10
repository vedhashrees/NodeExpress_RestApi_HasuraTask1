const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const request = require('request')
const async =  require('async')
const bodyParser = require('body-parser')

// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser());
//need bodyParser for any Request POST/PUT body object 
app.use(bodyParser.urlencoded({ extended: false }));
// let static middleware do its job
app.use(express.static(__dirname + '/public'));



// routes

app.get('/', (req, res) => res.send('Hello World - Vedhashree'));
app.get('/authors', fetchAuthorDetails);
app.get('/setcookie' , setCookieValue);
app.get('/getcookies' , getCookieValue);
app.get('/robots.txt', denyRequest);
app.get('/html' , fetchHtmlPage);
app.get('/image' , fetchImage);
app.post('/captureInput' , captureInput);



//route handlers

function captureInput(req,res){
	
   console.log(req.body);
   res.send('Thanks !!! Captured your input data !! Bye ..')
   res.redirect('/')

}

function fetchImage(req,res){
var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  
    res.sendFile('parrots.jpg',options,function (err) {
    if (err) {
      console.log(err);
	  res.send(err);
    } else {
      console.log('Sent:', 'parrots.jpg');
    }
  });

}

function fetchHtmlPage(req,res){
	var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  
    res.sendFile('hello.html',options,function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Sent:', 'hello.html');
    }
  });

}

function denyRequest(req,res){
  request('http://httpbin.org/deny', function (error, response, body) {
	   res.send('<pre style="word-wrap: break-word; white-space: pre-wrap;">'+ body +'</pre>');
  });
}


// set a cookie
function setCookieValue (req, res) {
  // check if client sent cookie
  let cookie =  req.cookies.name;
  
  console.log(cookie)
  console.log(new Date() ,  new Date(Date.now() + 2000))
  
  if(cookie === undefined){
  
	res.cookie('name', 'vedhashree' , {expires: new Date(Date.now() + 100000),httpOnly: true, path: '/'}) //Sets name = express
	res.cookie('age', '32' , {expires: new Date(Date.now() + 100000),httpOnly: true, path: '/'}).send('cookie set'); //Sets name = express
	
  }else{
    console.log('Cookie already set');
	res.send('Cookie already set');
  }
};


function getCookieValue(req,res){
   // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);
  (req.cookies.name !== undefined) ? res.send(req.cookies) : res.send('No Cookies Set at the moment')
  
}


var fetchAuthorList = (callback) => {
  
  request('https://jsonplaceholder.typicode.com/users', function (error, response, body) {
	   callback(null, body);
  });
  
}

var fetchPostList = (callback) => {
  
  request('https://jsonplaceholder.typicode.com/posts', function (error, response, body) {
		callback(null, body);
  });

}

function getUsersPostCount(posts){
 var countObj = posts.reduce(function(obj, v) {
		  // increment or set the property
		  // `(obj[v.status] || 0)` returns the property value if defined
		  // or 0 ( since `undefined` is a falsy value
		  obj[v.userId] = (obj[v.userId] || 0) + 1;
		  // return the updated object
		  return obj
		  // set the initial value as an object
		}, {})
		
		return countObj;
		

/* Basic approach 
	let tobj = [];
	for(i = 0 ; i< posts.length ; i++){
		console.log("posts[i]['userId']" , posts[i]['userId'])
		tobj[posts[i]['userId']] = (tobj[posts[i]['userId']] || 0) + 1
		console.log("tobj[posts[i]['userId']]" , tobj[posts[i]['userId']])
	}
*/	
}

function decorateResponse(authorsList,userPostsCnt){
	var countResponse =authorsList.map((obj , index) => {
		obj.PostsCount = userPostsCnt[index];
		return obj
	})
    
	return countResponse
}

function fetchAuthorDetails(req,res) {
	
	async.parallel([
			fetchAuthorList,
			fetchPostList		
		],
		function(err,results){
		  
		  let authorsList = JSON.parse(results[0]);
		  let postList = JSON.parse(results[1]);
		  
		  let userPostsCnt = getUsersPostCount(postList);  
		  let authorsListResponse =  decorateResponse(authorsList,userPostsCnt)
		  console.log(authorsListResponse.forEach((author)=>{
			  console.log(author) + '\n'
			  console.log("====================================================================");
		  }))
          res.send(authorsListResponse)	  
		}
	);

}	


app.listen(3000, () => console.log('hpdf-task1 app listening on port 3000!'))