angular.module('app', ['ui.router', 'nvd3'])
    .config(["$stateProvider", "$compileProvider", function ($stateProvider, $compileProvider) {
        $stateProvider
            .state('grafico1', {
                templateUrl: 'views/grafico.html',
                controller: 'grafico1'
            })
            .state('otro', {
                templateUrl: 'views/otro.html',
                controller: 'otro'
            })
        //False en modo de produccion
        /*$compileProvider.debugInfoEnabled(false)
        $compileProvider.commentDirectivesEnabled(false)
        $compileProvider.cssClassDirectivesEnabled(false)*/
        
    }])
    .run(["$state", "$http", "$templateCache", function ($state, $http, $templateCache) {
        $state.go("grafico1")
    }])
    .controller('otro', [function(){
        console.log("en otro")
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
        };

        $scope.data = [
            {
      "key": 1,
      "values": [ [ 0 , 100] , [ 1 , 6.3382185140371] , [ 2 , 5.9507873460847] , [ 3 , 11.569146943813] ]
    },
    {
      "key": 2,
      "values": [ [ 0, 98] , [ 1 , 3] , [ 2 , 3] , [ 3 , 4] ]
    }

            
        ]


    }])