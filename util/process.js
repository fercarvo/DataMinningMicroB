var { stopwords } = require('../DB/stopwords.js')
var snowball = require('node-snowball')
var fs = require('fs')
const { fork } = require('child_process')
var nj = require('numjs')
var moment = require('moment')


module.exports = {
	processTweet: processTweet,
	cleaner: cleaner,
	stopwords: stopwords,
	processPromise: processPromise,
	JPP: JPP,
	quitarAcentos: quitarAcentos,
	eachParallel, 
	eachSeries,
	cleanM,
	isToday
}


/*
	Funcion que procesa un tweet y lo devuelve limpio
*/
function processTweet(tweet) {
	return {
		id : tweet.id,
		tweet : tweet.text,
		clean_data : null,
		usuario : "@" + tweet.user.screen_name,
	}
}

//Recibe una fecha y hora, devuelve true si es de hoy, false caso contrario
function isToday (date) {
	var start = moment.utc().startOf('day').toDate()
	var end = moment.utc().endOf('day').toDate()

	if (date >= start && date <= end) 
		return true
	
	return false
}

//Ejecuta en serie todas las operaciones
function eachSeries(array, fn) {
	return new Promise(function (resolve, reject) {

		var resolved_data = []
		var index = 0

		fn(array[index], next, error)

		function next(data) {
			resolved_data.push( data )

			if (++index < array.length)
				fn(array[index], next, error)
			else
				resolve(resolved_data)
		}

		function error(error) {
			return reject(error)
		}

	})
}

//Ejecuta en paralelo todas las operaciones
function eachParallel(array, fn) {
	return new Promise(function (resolveGlobal, rejectGlobal) {

		var resolved_data = []
		var resolved = 0

		for (obj of array )
			fn(obj, resolveObj, error)

		function resolveObj(data) {
			resolved_data.push( data )

			if (++resolved >= array.length)
				return resolveGlobal(resolved_data)
		}

		function error(error) {
			return rejectGlobal(error)
		}	

	})
}

//Sin uso
/*
function dbTweet (dirname, tweet){
	var tweets = JSON.parse( fs.readFileSync(dirname, 'utf8') )
	tweets.push(tweet)

	fs.writeFileSync( dirname, JSON.stringify(tweets), "utf8")
}
*/


/*
	Funcion que recibe un string y devuelve un array de palabras limpias
*/
function cleaner(string) {

	if (!string || string.length<=3)
		return []

	try {
		string = string.toLowerCase(); //todo a minusculas
		string = string.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') //Se elimina URLs
		string = string.replace(/\B@[a-z0-9_-]+/gi, "") //Se elimina las menciones, no solo el @, todo
		string = quitarAcentos(string)
		var array = string.match(/\b(\w+)\b/g) //Se convierte string a array de palabras
		array = array.filter(word => word.length>2 && word.length<=21 && stopwords.indexOf(word)<0)
		array = array.filter(word => !word.includes("jaja"))

		//array = snowball.stemword(array, 'spanish') //Se realiza el stemming
		return array

	} catch (error) {
		return []
	}	
}

//Sin uso
/*
function storageTweets (path, new_tweets) {
	var DB_tweets

	fs.readFile(path, 'utf8', function(error, data_string){
		if (error) {
			console.log("Error al leer tweets de la BD", error)
		} else {
			DB_tweets = JSON.parse(data_string)

			for (DB_tweet of DB_tweets) {
				var i = new_tweets.length
				while (i--) {
				    if (new_tweets[i].id == DB_tweet.id)
				    	new_tweets.splice(i, 1)
				}
			}

			var new_DB = DB_tweets.concat(new_tweets)

			fs.writeFile('DB/storage.json', JSON.stringify(new_DB), 'utf8', function (error){
				if (error)
					return console.log("No se ha podido guardar los tweet", error)

				console.log("Se guardo en la BD")
			})

		}
	})
}*/

/*
	Función que ejecuta un proceso con la sintaxis de promises
*/
function processPromise (path, data) {
	return new Promise(function(resolve, reject){
		var child = fork(path)

		child.send(data)

		child.on("message", function (result){

			if (result.error) {
				reject(new Error(result.error))
				return child.kill()
			}

			resolve(result)
			return child.kill()
		})
	})
}


/*
	Algoritmo JPP
*/
function JPP (X, R, k, alpha, lambda, epsilon, maxiter){

	var dot = (A, B) => nj.dot(A,B)

	var ComputeLoss = (X, W, H, M, R, reg_norm, reg_temp, trXX, I)=>{
		var WtW = dot(W.T, W)
		var MR = dot(M, R)
		var WH = dot(W, H)
		var WMR = dot(W, MR)

		var tr1 = trXX - (2*tr(X, WH)) + (tr(WH, WH))
		var tr2 = trXX - (2*tr(X,WMR)) + (tr(WMR, WMR))
		var tr3 = reg_temp * ( tr(M,M) - (2 * M.diag().sum()) + (I.diag().sum()) )
		var tr4 = reg_norm * (H.sum() + W.sum() + M.sum())
		var Obj = tr1 + tr2 + tr3 + tr4

		return Obj
	}

	var maxMatlab = (matrix, escalar)=>{
		var temp = matrix.tolist()
		for (var i = 0; i < temp.length; i++) {
			for (var j = 0; j < temp[0].length; j++) {
				if (escalar > temp[i][j])
					temp[i][j] = escalar
			}
		}

		return nj.array(temp)
	}

	var tr = (A, B)=>{
		var mult = A.multiply(B)
		return mult.sum()
	}

	X = nj.array( cleanM(X) )
	R = nj.array( cleanM(R) )

	var n = X.shape[0] // # filas X
	var v1 = X.shape[1] // # columnas X
	var W = nj.random([n,k]) //Matriz aleatoria de n x k
	//var H = nj.random([k,v1]) //Matriz aleatoria de k x v1
	var H = R
	var M = nj.random([k,k]) //Matriz aleatoria de k x k
	var I = nj.identity(k) //Matriz identidad k x k
	var Ilambda = I.multiply(lambda) //Multiplicacion matricial
	var trXX = tr(X, X) //..

	//iteration counters
	var itNum = 1
	var Obj = 10000000
	var eps = 2^(-52)
	var prevObj = 2*Obj
	var J
	var W_1, W_2, W_3, W_4
	var WtW, WtX
	var M_1, M_2, M_3, M_4, M_5
	var H_1, H_2
	var delta



	while ((Math.abs(prevObj-Obj) > epsilon) && (itNum <= maxiter)) {

		J = dot(M, R) // Multiplicacion matricial

		//W =  W .* ( M_1  ./ max(W*(M_2),eps) ); % eps = 2^(-52)
		W_1 = dot(X, (H.T).add(J.T) )//X*(H'+J')
		W_2 = ( ( dot(J, J.T)).add( dot(H, H.T)) ).add(lambda)   //((J*J')+(H*H')+ lambda) //
		W_3 = dot(W, W_2)
		W_4 = maxMatlab(W_3, eps) //////////////////////////////////////////
		W = W.multiply( W_1.divide( W_4 ))

		WtW = dot( W.T , W)//W'*W
		WtX = dot( W.T, X) //W'*X;

		//M = M .* ( ((WtX*R') + (alpha*I)) ./ max( (WtW*M*R*R') + ( (alpha)*M)+lambda,eps) );
		M_1 = ( dot(WtX, R.T) ).add( I.multiply(alpha))   //(WtX*R') + (alpha*I)
		M_2 = dot( dot( dot(WtW, M) , R) , R.T) //(WtW*M*R*R')
		M_3 = ( M.multiply(alpha) ).add(lambda)  //( (alpha)*M) + lambda
		M_4 = M_2.add(M_3)// (WtW*M*R*R') + ( (alpha)*M) + lambda
		M_5 = maxMatlab(M_4, eps)
		M = M.multiply( M_1.divide(M_5)) //M_1 ./ M_5

		//H = H .* (WtX./max(WtW*H+lambda,eps));
		H_1 = ( dot(WtW, H)).add(lambda)//WtW*H+lambda
		H_2 = maxMatlab(H_1, eps)
		H = H.multiply( WtX.divide(H_2) ) //H .* (WtX./max(H_1,eps));

		prevObj = Obj
		Obj = ComputeLoss(X,W,H,M,R,lambda,alpha, trXX, I)
		delta = Math.abs(prevObj-Obj) //delta = abs(prevObj-Obj);

		itNum++
	}

	return { 
		W: W.tolist(),
		H: H.tolist(),
		M: M.tolist() 
	}	
}



// quitar acentos

function quitarAcentos(cadena){
	var defaultDiacriticsRemovalMap = [
        {base:'A', letters:'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
        {base:'AA',letters:'\uA732'},
        {base:'AE',letters:'\u00C6\u01FC\u01E2'},
        {base:'AO',letters:'\uA734'},
        {base:'AU',letters:'\uA736'},
        {base:'AV',letters:'\uA738\uA73A'},
        {base:'AY',letters:'\uA73C'},
        {base:'E', letters:'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
        {base:'I', letters:'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
        {base:'O', letters:'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
        {base:'OI',letters:'\u01A2'},
        {base:'OO',letters:'\uA74E'},
        {base:'OU',letters:'\u0222'},
        {base:'OE',letters:'\u008C\u0152'},       
        {base:'U', letters:'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
        {base:'a', letters:'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
        {base:'aa',letters:'\uA733'},
        {base:'ae',letters:'\u00E6\u01FD\u01E3'},
        {base:'ao',letters:'\uA735'},
        {base:'au',letters:'\uA737'},
        {base:'av',letters:'\uA739\uA73B'},
        {base:'ay',letters:'\uA73D'},
        {base:'e', letters:'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
        {base:'i', letters:'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
        {base:'o', letters:'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
        {base:'oi',letters:'\u01A3'},
        {base:'ou',letters:'\u0223'},
        {base:'oo',letters:'\uA74F'},
        {base:'oe',letters:'\u009C\u0153'},
        {base:'u',letters: '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'}
    ];

    var diacriticsMap = {};
    for (var i=0; i < defaultDiacriticsRemovalMap .length; i++){
        var letters = defaultDiacriticsRemovalMap [i].letters;
        for (var j=0; j < letters.length ; j++){
            diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap [i].base;
        }
    }

    var removeDiacritics = str => str.replace(/[^\u0000-\u007E]/g, a => diacriticsMap[a] || a)
	
	return removeDiacritics(cadena)
 }

//Verifica que una matriz no tenga valores diferentes de numeros
function cleanM(matrix) {
	for (var i = 0; i < matrix.length; i++) {
		for (var j = 0; j < matrix[i].length; j++) {
			if (typeof matrix[i][j] !== "number")
				matrix[i][j] = 0.000000001
		}
	}

	return matrix
}