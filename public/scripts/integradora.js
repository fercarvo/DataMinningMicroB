angular.module('app', ['ui.router', 'nvd3'])
    .config(["$stateProvider", "$compileProvider", function ($stateProvider, $compileProvider) {
        $stateProvider
            .state('home', {
                templateUrl: 'views/home.html',
                controller: 'home'
            })
            .state('dias', {
                templateUrl: 'views/dias.html',
                controller: 'dias'
            })
            .state('grafico1', {
                templateUrl: 'views/grafico.html',
                controller: 'grafico1'
            })
            .state('listener', {
                templateUrl: 'views/stream.html',
                controller: 'listener'
            })
            .state('grafico2', {
                templateUrl: "views/grafico2.html",
                controller: "grafico2"
            })
        
    }])
    .run(["$state", "$http", "$templateCache", function ($state, $http, $templateCache) {

        loadTemplates($state, "home", $http, $templateCache)

    }])
    .controller("home", [function () {

    }])
    .controller('dias', ["$scope", "$state", "$http", function($scope, $state, $http){

        $http.get("/corpus")
            .then(res => {$scope.data = res.data})
            .catch(e=> console.log(e))



    }])
    .controller('listener', ["$scope", "$state", function($scope, $state){

        var socket = io.connect('http://localhost:3001', {'forceNew':true })

        $scope.tweets = []

        socket.on('tweet', function (tweet) {

            if ($scope.tweets.length >= 25)
                $scope.tweets.pop()

            $scope.tweets.unshift(tweet)
            $scope.$apply()
        })

        $scope.$on('$destroy', ()=>  socket.close())



    }])
    .controller('grafico1', ["$scope", "$state", "$http", function ($scope, $state, $http) {

        setTimeout(()=> alert("Por favor, espere mientras se procesa la informacion"), 1500)

        $http.get('/corpus/5a41910005020b5fb91d6cbe/5a42e2803e12a67103e96817/jpp/4').then( function (res){

            var M = res.data.M
            var topicos_1 = res.data.topicos_1
            var topicos_2 = res.data.topicos_2

            var data_mapa = []
            for (var i = 0; i < M.length; i++) {     
                for (var j = 0; j < M[i].length; j++) {
                    data_mapa.push([i, j, M[i][j]])
                }
            }

            console.log(topicos_1)
            console.log(topicos_2)

            var topicos = []

            for (var i = 0; i < M.length; i++)
                topicos.push(`topico ${i+1}`)
            

            Highcharts.chart('container', {

                chart: {
                    type: 'heatmap',
                    marginTop: 40,
                    marginBottom: 80,
                    plotBorderWidth: 1
                },

                title: {
                    text: 'Mapa de calor de la matriz M por periodos'
                },

                xAxis: {
                    categories: topicos//['topico1', 'topico2', 'topico3', 'topico4', 'topico5']
                },

                yAxis: {
                    categories: topicos,
                    title: null
                },

                colorAxis: {
                    min: 0,
                    minColor: '#FFFFFF',
                    maxColor: Highcharts.getOptions().colors[0]
                },

                legend: {
                    align: 'right',
                    layout: 'vertical',
                    margin: 0,
                    verticalAlign: 'top',
                    y: 25,
                    symbolHeight: 280
                },

                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> del periodo 1, se relaciona en <br><b>' + this.point.value + '</b>  con <b>' + this.series.yAxis.categories[this.point.y] + '</b> del periodo 2';
                    }
                },

                series: [{
                    name: 'Sales per employee',
                    borderWidth: 1,
                    data: data_mapa,
                    dataLabels: {
                        enabled: true,
                        color: '#000000'
                    }
                }]

            });

        }).catch(function (error) {
            console.log(error)
        })

    }])
    .controller('grafico2', ["$scope", function($scope){

        $scope.options = {
            chart: {
                type: 'multiBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 45,
                    left: 45
                },
                clipEdge: true,
                //staggerLabels: true,
                duration: 500,
                stacked: true,
                xAxis: {
                    axisLabel: 'Topico por dia',
                    showMaxMin: false,
                    tickFormat: function(d){
                        return d3.format(',f')(d);
                    }
                },
                yAxis: {
                    axisLabel: 'Relacion topico',
                    axisLabelDistance: -20,
                    tickFormat: function(d){
                        return d3.format(',.1f')(d);
                    }
                }
            }
        };



        var data = [
            {
                key: "topico 1",
                values: [
                    {
                        key: "topico 1",
                        series: 0,
                        size: 0.1,
                        x: 0,
                        y: 1.3
                    },{
                        key: "topico 1",
                        series: 0,
                        size: 0.8,
                        x: 1,
                        y: 0.5
                    }
                ]
            },{
                key: "topico 2",
                values: [
                    {
                        key: "topico 2",
                        series: 1,
                        size: 0.9,
                        x: 0,
                        y: 0.1
                    },{
                        key: "topico 2",
                        series: 1,
                        size: 1,
                        x: 1,
                        y: 0.9
                    }
                ]
            }
        ]

        $scope.data = generateData();

        console.log($scope.data)

        /* Random Data Generator (took from nvd3.org) */
        function generateData() {
            return stream_layers(3,50+Math.random()*50,.1).map(function(data, i) {
                return {
                    key: `Topico ${i}`,
                    values: data
                };
            });
        }

        /* Inspired by Lee Byron's test data generator. */
        function stream_layers(n, m, o) {
            if (arguments.length < 3) o = 0;
            function bump(a) {
                var x = 1 / (.1 + Math.random()),
                    y = 2 * Math.random() - .5,
                    z = 10 / (.1 + Math.random());
                for (var i = 0; i < m; i++) {
                    var w = (i / m - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }
            return d3.range(n).map(function() {
                var a = [], i;
                for (i = 0; i < m; i++) a[i] = o + o * Math.random();
                for (i = 0; i < 5; i++) bump(a);
                return a.map(stream_index);
            });
        }

        /* Another layer generator using gamma distributions. */
        function stream_waves(n, m) {
            return d3.range(n).map(function(i) {
                return d3.range(m).map(function(j) {
                    var x = 20 * j / m - i / 3;
                    return 2 * x * Math.exp(-.5 * x);
                }).map(stream_index);
            });
        }

        function stream_index(d, i) {
            return {x: i, y: Math.max(0, d)};
        }


}])
/*
setInterval(()=>{console.log("Not blocked code" + Math.random())}, 900)

function bla(block){
    //This will block for 10 sec, but
    block(10000) //This blockCpu function is defined below
    return "\n\nbla bla\n" //This is catched in the resolved promise

}

genericWorker(window, ["blockCpu", bla]).then(function (result){
    console.log("End of blocking code", result)
})
.catch(function(error) { console.log(error) })
*/

/*  A Web Worker that does not use a File, it create that from a Blob
    @cb_context, The context where the callback functions arguments are, ex: window
    @cb, ["fn_name1", "fn_name2", function (fn1, fn2) {}]
        The callback will be executed, and you can pass other functions to that cb
*/
/*function genericWorker(cb_context, cb) {
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

        var worker_file = window.URL.createObjectURL( new Blob(["self.addEventListener('message', function(e) { var bb = {}; var args = []; for (fn of e.data.functions) { bb[fn.name] = new Function(fn.args, fn.body); args.push(fn.name)}; var callback = new Function( e.data.callback.args, e.data.callback.body); args = args.map(function(fn_name) { return bb[fn_name] });  var result = callback.apply(null, args) ;self.postMessage( result );}, false)"]) )
        var worker = new Worker(worker_file)

        worker.postMessage({ callback: callback, functions: functions })

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
}*/

//random blocking function
/*
function blockCpu(ms) {
    var now = new Date().getTime();
    var result = 0
    while(true) {
        result += Math.random() * Math.random();
        if (new Date().getTime() > now +ms)
            return;
    }   
}*/
