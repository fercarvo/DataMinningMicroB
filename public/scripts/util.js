//export {ready, genericWorker}

console.log("ble ble ble")

function ready(){
    $(document).ready(function () {
        $("#sidebar").mCustomScrollbar({
            theme: "minimal"
        });

        $('#dismiss, .overlay').on('click', function () {
            $('#sidebar').removeClass('active');
            $('.overlay').fadeOut();
        });

        $('#sidebarCollapse').on('click', function () {
            $('#sidebar').addClass('active');
            $('.overlay').fadeIn();
            $('.collapse.in').toggleClass('in');
            $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        });
    })  
}

/*  A Web Worker that does not use a File, it create that from a Blob
    @cb_context, The context where the callback functions arguments are, ex: window
    @cb, ["fn_name1", "fn_name2", function (fn1, fn2) {}]
        The callback will be executed, and you can pass other functions to that cb
*/
function genericWorker(data, cb_context, cb) {
    return new Promise(function (resolve, reject) {

        if (!cb || !Array.isArray(cb))
            return reject("Invalid data")

        var callback = cb.pop()
        var functions = cb

        if (typeof callback != "function" || functions.some((fn)=>{return typeof cb_context[fn] != "function"}))
            return reject(`The callback or some of the parameters: (${functions.toString()}) are not functions`)

        if (functions.length>0 && !cb_context)
            return reject("context is undefined")

        callback = fn_string(callback) //Callback to be executed
        functions = functions.map((fn_name)=> { return fn_string( cb_context[fn_name] ) })

        var worker_file = window.URL.createObjectURL( new Blob(["self.addEventListener('message', function(e) { var bb = {}; var args = []; for (fn of e.data.functions) { bb[fn.name] = new Function(fn.args, fn.body); args.push(fn.name)}; var callback = new Function( e.data.callback.args, e.data.callback.body); args = args.map(function(fn_name) { return bb[fn_name] }); args.unshift(e.data.data);  var result = callback.apply(null, args) ;self.postMessage( result );}, false)"]) )
        var worker = new Worker(worker_file)

        worker.postMessage({ callback, functions, data })

        worker.addEventListener('error', function(error){ return reject(error.message) })

        worker.addEventListener('message', function(e) {
            resolve(e.data), worker.terminate()
        }, false)

        //From function to string, with its name, arguments and its body
        function fn_string (fn) {
            var name = fn.name, fn = fn.toString()

            return { name: name, 
                args: fn.substring(fn.indexOf("(") + 1, fn.indexOf(")")),
                body: fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"))
            }
        }
    })
}