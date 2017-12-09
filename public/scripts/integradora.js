angular.module('app', ['ui.router', 'nvd3'])
    .config(["$stateProvider", "$compileProvider", function ($stateProvider, $compileProvider) {
        $stateProvider
            .state('home', {
                templateUrl: 'views/home.html',
                controller: 'home'
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
        //False en modo de produccion
        /*$compileProvider.debugInfoEnabled(false)
        $compileProvider.commentDirectivesEnabled(false)
        $compileProvider.cssClassDirectivesEnabled(false)*/
        
    }])
    .run(["$state", "$http", "$templateCache", function ($state, $http, $templateCache) {
        $state.go("home")
    }])
    .controller('listener', ["$scope", "$state", function($scope, $state){
        var socket = io('http://localhost:3001')
        $scope.tweets = []

        socket.on('tweet', function (tweet) {
            //console.log($scope.tweets)
            $scope.tweets.push(tweet)
            $scope.$apply();
            //socket.emit('my other event', { my: 'data' });
        })
        $scope.$on('$destroy', function(){
            socket.close()
        })
    }])
    .controller('grafico1', ["$scope", "$state", "$http", function ($scope, $state, $http) {

         $scope.options = {
            chart: {
                type: 'stackedAreaChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 40
                },
                x: function(d){return d[0];},
                y: function(d){return d[1];},
                useVoronoi: false,
                clipEdge: true,
                duration: 100,
                useInteractiveGuideline: true,
                xAxis: {
                    showMaxMin: false,
                    tickFormat: function(d) {
                        var meses = ["lunes", "martes", "miercoles", "jueves"]
                        return meses[d]
                    }
                },
                yAxis: {
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                },
                zoom: {
                    enabled: true,
                    scaleExtent: [1, 10],
                    useFixedDomain: true,
                    useNiceScale: false,
                    horizontalOff: false,
                    verticalOff: true,
                    unzoomEventType: 'dblclick.zoom'
                }
            }
        }

        $scope.data = [ 
            {
                "key": 1,
                "values": [ [ 0 , 100] , [ 1 , 60] , [ 2 , 5.9507873460847] , [ 3 , 11.569146943813] ]
            },
            {
                "key": 2,
                "values": [ [ 0 , 100] , [ 1 , 60] , [ 2 , 3] , [ 3 , 4] ]
            }            
        ]
    }])
    .controller('grafico2', function($scope){

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


})