var stopwords = require('../DB/stopwords.json')
var snowball = require('node-snowball')
var fs = require('fs')
const { fork } = require('child_process')
var nj = require('numjs')


module.exports = {
	processTweet: processTweet,
	cleaner: cleaner,
	storageTweets: storageTweets,
	stopwords: stopwords,
	longCompute: longCompute,
	processPromise: processPromise
}

/*
	Funcion que procesa un tweet y lo devuelve limpio
*/
function processTweet(tweet, stopwords) {
	var clean_tweet = cleaner(tweet.text, stopwords)

	return {
		id : tweet.id,
		tweet : tweet.text,
		clean_data : clean_tweet,
		usuario : "@" + tweet.user.screen_name,
		nombre : tweet.user.name 
	}
}


/*
	Funcion que recibe un string y devuelve un array de palabras limpias
*/
function cleaner(string, stopwords) {

	if (!string || !stopwords)
		throw new Error("No existe el string o los stopwords")

	string = string.toLowerCase(); //todo a minusculas
	string = string.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') //Se elimina URLs
	array = string.match(/\b(\w+)\b/g) //Se convierte string a array de palabras

	for (word of stopwords) { //Se elimina stopwords
		var i = array.length
		while (i--) {
		    if (array[i] == word)
		    	array.splice(i, 1)
		}
	}

	array = snowball.stemword(array, 'spanish') //Se realiza el stemming
	return array
}

/*
	Funcion que recibe nuevos tweets y los almacena en un archivo con los demas
*/
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
}

/*
	Simulador de procesamiento de CPU
*/
function longCompute(text) {
	var sum = 1
	var cantidad = 100000
	for (var i = 0; i < cantidad; i++) {
		sum+=1
		console.log(sum + text)
	}

	return sum
}

/*
	Función que ejecuta un proceso con la sintaxis de promises
*/
function processPromise (path, data) {
	return new Promise(function(resolve, reject){
		var child = fork(path)

		child.send(data)

		child.on("message", function (result){
			resolve(result)
			child.kill()
		})
	})
}


/*
	Funcion tr, recibe 2 matrices de la misma longitud y devuelve la otra con la multiplicacion
	de sus terminos
*/
function tr(A, B) {
	var mult = A.multiply(B)
	return mult.sum()
}

/*
	Algoritmo JPP que recibe matrices


	while((abs(prevObj-Obj) > epsilon) && (itNum <= maxiter)),

     J= M*R;
     W =  W .* ( X*(H'+J')  ./ max(W*((J*J')+(H*H')+ lambda),eps) ); % eps = 2^(-52)
     WtW =W'*W;
     WtX = W'*X;     
     M = M .* ( ((WtX*R') + (alpha*I)) ./ max( (WtW*M*R*R') + ( (alpha)*M)+lambda,eps) );      
     H = H .* (WtX./max(WtW*H+lambda,eps));
     prevObj = Obj;
     Obj = computeLoss(X,W,H,M,R,lambda,alpha, trXX, I);
     delta = abs(prevObj-Obj);
 	 ObjHistory(itNum) = Obj;
 	 if verbose,
            fprintf('It: %d \t Obj: %f \t Delta: %f  \n', itNum, Obj, delta); 
     end
  	 itNum = itNum + 1;
end
*/
function JPP (X, R){
	var alpha = 6
	var lambda = 2
	var epsilon = 33
	var maxiter = 0
	var verbose = true
	var k = 6 //valor dado en el paper
	var n = b.shape[0] // # filas X
	var v1 = b.shape[1] // # columnas X
	var W = nj.random([n,k]) //Matriz aleatoria de n x k
	var H = nj.random([k,v1]) //Matriz aleatoria de k x v1
	var M = nj.random([k,k]) //Matriz aleatoria de k x k
	var I = nj.identity(k) //Matriz identidad k x k
	var Ilambda = nj.dot(I, lambda) //Multiplicacion matricial
	var trXX = tr(X, X) //..

	//iteration counters
	var itNum = 1
	var Obj = 10000000
	var eps = 2^(-52)

	var prevObj = 2*Obj
	var J

	var W_1
	var W_2
	var W_3
	var W_4

	var WtW
	var WtX

	var M_1
	var M_2
	var M_3
	var M_4
	var M_5

	var H_1
	var H_2

	var delta

	while ((Math.abs(prevObj-Obj) > epsilon) && (itNum <= maxiter)) {
		J = nj.dot(M, R) // Multiplicacion matricial

		//W =  W .* ( M_1  ./ max(W*(M_2),eps) ); % eps = 2^(-52)
		W_1 = nj.dot(X, (H.T).add(J.T) )//X*(H'+J')
		W_2 = ( ( nj.dot(J, J.T)).add( nj.dot(H, H.T)) ).add(lambda)   //((J*J')+(H*H')+ lambda) //
		W_3 = ( nj.dot(W, W_2)).max()
		W_4 = (function(){
			if (W_3 < eps) //max( (WtW*M*R*R') + ((alpha)*M) + lambda, eps)
				return eps
			return W_3
		})()
		W = W.multiply( W_1.divide( W_4 ))

		WtW = nj.dot( W.T , W)//W'*W
		WtX = nj.dot( W.T, X) //W'*X;

		//M = M .* ( ((WtX*R') + (alpha*I)) ./ max( (WtW*M*R*R') + ( (alpha)*M)+lambda,eps) );
		M_1 = ( nj.dot(WtX, R.T) ).add( nj.dot(alpha, I) )   //(WtX*R') + (alpha*I)
		M_2 = nj.dot( nj.dot( nj.dot(WtW, M) , R) , R.T) //(WtW*M*R*R')
		M_3 = ( nj.dot(alpha, M)).add(lambda)  //( (alpha)*M) + lambda
		M_4 = (M_2.add(M_3)).max()// (WtW*M*R*R') + ( (alpha)*M) + lambda
		M_5 = (function(){
			if (M_4 < eps) //max( (WtW*M*R*R') + ( (alpha)*M)+lambda,eps)
				return eps
			return M_4
		})()
		M = M.multiply( M_1.divide(M_5)) //M_1 ./ M_5

		H_1 = ( ( nj.dot(WtW, H)).add(lambda)).max()//WtW*H+lambda
		H_2 = (function(){
			if (H_1 < eps)
				return eps
			return H_1
		})()
		H = H.multiply( WtX.divide(H_2) ) //H .* (WtX./max(H_1,eps));

		prevObj = Obj
		Obj = ComputeLoss(X,W,H,M,R,lambda,alpha, trXX, I)
		delta = Math.abs(prevObj-Obj) //delta = abs(prevObj-Obj);
		//ObjHistory(itNum) = Obj;

		/*
		if verbose,
            fprintf('It: %d \t Obj: %f \t Delta: %f  \n', itNum, Obj, delta); 
     	end
		*/
		if (verbose) {
			console.log("It: " + itNum)
			console.log("Obj: " + Obj)
			console.log("Delta: " + delta)
		}

		itNum++
	}	
}

// ---hacer merge
/*

function Obj = computeLoss(X,W,H,M,R,reg_norm,reg_temp, trXX, I)
    WtW = W' * W;
    MR = M*R;
    WH = W * H;
    WMR = W * MR;    
    tr1 = trXX - 2*tr(X,WH) + tr(WH,WH);
    tr2 = trXX - 2*tr(X,WMR) + tr(WMR,WMR);
    tr3 = reg_temp*(tr(M,M) - 2*trace(M)+ trace(I));
    tr4 = reg_norm*(sum(sum(H)) + sum(sum(W)) + sum(sum(M)) );
    Obj = tr1+ tr2 + tr3+ tr4;    
end

*/


function ComputeLoss(X, W, H, M, R, reg_norm, reg_temp, trXX, I){
	var WtW = nj.dot(W.T, W)
	var MR = nj.dot(M, R)
	var WH = nj.dot(W, H)
	var WMR = nj.dot(W, MR)
	var tr1 = trXX - (2*tr(X, WH)) + tr(WH, WH)
	var tr2 = trXX - (2*tr(X, WMR)) + tr(WMR, WMR)
	var tr3 = reg_temp * (tr(M, N) - (2* M.trace()) + I.trace())
	var tr4 = reg_norm * (H.sum() + W.sum() + M.sum())
	var Obj = tr1 + tr2 + tr3 + tr4

	return Obj
}