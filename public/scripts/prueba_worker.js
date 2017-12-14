
self.addEventListener('message', function(e) {

	var worker_functions = {} //Functions used by callback
	var args = [] //Arguments of the callback

	for (fn of e.data.functions) {
		worker_functions[fn.name] = new Function(fn.args, fn.body)
		args.push(fn.name)
	}

	var callback = new Function( e.data.callback.args, e.data.callback.body) //Callback passed and reafy to be executed 

	args = args.map(function(fn_name) { return worker_functions[fn_name] }) //FUnctions loaded as arguments
	var result = callback.apply(null, args) //executing callback with function arguments
	self.postMessage( result )

}, false)


//"self.addEventListener('message', function(e) { var bb = {}; var args = []; for (fn of e.data.functions) { bb[fn.name] = new Function(fn.args, fn.body); args.push(fn.name)}; var callback = new Function( e.data.callback.args, e.data.callback.body); args = args.map(function(fn_name) { return bb[fn_name] });  var result = callback.apply(null, args) ;self.postMessage( result );}, false)"