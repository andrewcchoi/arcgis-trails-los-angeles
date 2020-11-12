require([
        "esri/Map",
        "esri/views/SceneView",
        "esri/widgets/BasemapToggle",
        "esri/widgets/BasemapGallery",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/widgets/Locate",
        "esri/widgets/Track",
        "esri/widgets/Compass"
    ], function(Map, SceneView, BasemapToggle, BasemapGallery, FeatureLayer,
        GraphicsLayer, Graphic, Locate, Track, Compass) {

    var map = new Map({
        // basemap: "streets-night-vector"
        // basemap: "streets-navigation-vector"
        basemap: "topo-vector",
        ground: "world-elevation"  // show elevation
    });

    var view = new SceneView({
        container: "viewDiv",
        map: map,
        // camera: {
        //     position: {  // observation point
        //         x: -118.80800,
        //         y: 33.96100,
        //         z: 25000 // altitude in meters
        //     },
        //     tilt: 65  // perspective in degrees
        camera: {
            position: {  // observation point
                x: -118.63500,
                y: 33.67700,
                z: 25000 // altitude in meters
            },
            tilt: 65  // perspective in degrees
        }
    });

    var locate = new Locate({
        view: view,
        useHeadingEnabled: false,
        goToOverride: function(view, options) {
            options.target.scale = 1500;  // Override the default map scale
            return view.goTo(options.target);
        }
    });

    view.ui.add(locate, "top-left");
    
    var track = new Track({
        view: view,
        graphic: new Graphic({
            symbol: {
                type: "simple-marker",
                size: "12px",
                color: "green",
                outline: {
                    color: "#efefef",
                    width: "1.5px"
                }
            }
        }),
        useHeadingEnabled: false  // Don't change orientation of the map
    });

    view.ui.add(track, "top-left");

    var compass = new Compass({
        view: view
    });

    view.ui.add(compass, "top-left");

    // // layer filter query
    // var sqlExpressions = ["TRL_ID = 0", "TRL_ID > 0",  "USE_BIKE = 'Yes'", "USE_BIKE = 'No'", "ELEV_GAIN < 1000", "ELEV_GAIN > 1000", "TRL_NAME = 'California Coastal Trail'"];

    // var selectFilter = document.createElement("select");
    // selectFilter.setAttribute("class", "esri-widget esri-select");
    // selectFilter.setAttribute("style", "width: 275px; font-family: Avenir Next W00; font-size: 1em;");
    
    // sqlExpressions.forEach(function(sql){
    //     var option = document.createElement("option");
    //     option.value = sql;
    //     option.innerHTML = sql;
    //     selectFilter.appendChild(option);
    // });
    
    // view.ui.add(selectFilter, "top-right");
    
    var basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "satellite"
    });
    
    view.ui.add(basemapToggle, "bottom-right");
    
    // coordinates
    var coordsWidget = document.createElement("div");
    coordsWidget.id = "coordsWidget";
    coordsWidget.className = "esri-widget esri-component";
    coordsWidget.style.padding = "7px 15px 5px";

    view.ui.add(coordsWidget, "bottom-right");

    function showCoordinates(pt) {
        // lat and long coord
        var coords = "Lat/Lon " + pt.latitude.toFixed(6) + " " + pt.longitude.toFixed(6) +
            " | Scale 1:" + Math.round(view.scale * 1) / 1 +
            " | Zoom " + view.zoom;
        coordsWidget.innerHTML = coords;

        // // x & y coord
        // var coords = "Lat/Lon " + pt.x.toFixed(3) + " " + pt.y.toFixed(3) +
        //      " | Scale 1:" + Math.round(view.scale * 1) / 1 +
        //      " | Zoom " + view.zoom;
        // coordsWidget.innerHTML = coords;
    }

    view.watch("stationary", function(isStationary) {
        showCoordinates(view.center);
    });

    view.on("pointer-move", function(evt) {
        showCoordinates(view.toMap({ x: evt.x, y: evt.y }));
    });

    var basemapGallery = new BasemapGallery({
        view: view,
        source: {
            portal: {
                url: "https://www.arcgis.com",
                useVectorBasemaps: true  // Load vector tile basemaps
                // useVectorBasemaps: false  // Load raster tile basemaps
            }
        }
    });
        
    view.ui.add(basemapGallery, "top-right");

    // Trailheads feature layer (points)
    var trailheadsLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0"
    });

    // map.add(trailheadsLayer);

    var trailheadsRenderer = {
        type: "simple",
        symbol: {
            type: "picture-marker",
            url: "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0231b.png",
            width: "18px",
            height: "18px"
        }
    };

    var trailheadsLabels = {
        symbol: {
            type: "text",
            color: "#FFFFFF",
            haloColor: "#5E8D74",
            haloSize: "2px",
            font: {
                size: "12px",
                family: "Noto Sans",
                style: "italic",
                weight: "normal"
            }
        },
        labelPlacement: "above-center",
        labelExpressionInfo: {
            expression: "$feature.TRL_NAME"
        }
    };

    var trailheads = new FeatureLayer({
        url:
            "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
        renderer: trailheadsRenderer,
        labelingInfo: [trailheadsLabels]
    });

    map.add(trailheads);

    var trailsRenderer = {
        type: "simple",
        symbol: {
            color: "#BA55D3",
            type: "simple-line",
            style: "solid"
        },
        visualVariables: [
            {
                type: "size",
                field: "ELEV_GAIN",
                minDataValue: 0,
                maxDataValue: 2300,
                minSize: "3px",
                maxSize: "7px"
            }
        ]
    };

    var trails = new FeatureLayer({
        url:
            "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
        renderer: trailsRenderer,
        opacity: .75
    });

    map.add(trails, 0);

    var bikeTrailsRenderer = {
        type: "simple",
        symbol: {
            type: "simple-line",
            style: "short-dot",
            color: "#FF91FF",
            width: "1px"
        }
    };

    var bikeTrails = new FeatureLayer({
        url:
            "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
        renderer: bikeTrailsRenderer,
        definitionExpression: "USE_BIKE = 'YES'"
    });

    map.add(bikeTrails, 1);

    function createFillSymbol(value, color) {
        return {
            value: value,
            symbol: {
                color: color,
                type: "simple-fill",
                style: "solid",
                outline: {
                    style: "none"
                }
            },
            label: value
        };
    }

    var openSpacesRenderer = {
        type: "unique-value",
        field: "TYPE",
        uniqueValueInfos: [
            createFillSymbol("Natural Areas", "#9E559C"),
            createFillSymbol("Regional Open Space", "#A7C636"),
            createFillSymbol("Local Park", "#149ECE"),
            createFillSymbol("Regional Recreation Park", "#ED5151")
        ]
    };

    var openspaces = new FeatureLayer({
        url:
            "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0",
        renderer: openSpacesRenderer,
        opacity: 0.40
    });

    map.add(openspaces, 0);

    // Trails feature layer (lines)
    var trailsLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
        //*** ADD ***//
        // definitionExpression: "ELEV_GAIN < 250",

        //*** ADD ***//
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-line",
                color: "green",
                width: "2px"
            }
        },

        //*** ADD ***//
        outFields: ["TRL_NAME","ELEV_GAIN"],

        //*** ADD ***//
        popupTemplate: {  // Enable a popup
            title: "{TRL_NAME}", // Show attribute value
            content: "The trail elevation gain is {ELEV_GAIN} ft."  // Display text in pop-up
        }
    });

    // map.add(trailsLayer, 0);

    // Parks and open spaces (polygons)
    var parksLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0"
    });

    // map.add(parksLayer, 0);

    // popup using html
    var popupTrailheads = {
        "title": "{TRL_NAME}",
        "content": "<b>City:</b> {CITY_JUR}<br><b>Cross Street:</b> {X_STREET}<br><b>Parking:</b> {PARKING}<br><b>Elevation:</b> {ELEV_FT} ft"
    }

    var trailheads = new FeatureLayer({
        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0",
        outFields: ["TRL_NAME","CITY_JUR","X_STREET","PARKING","ELEV_FT"],
        popupTemplate: popupTrailheads
    });

    map.add(trailheads);

    // popup using funtion
    var popupTrails = {
        "title": "Trail Information",
        // "content": function(){
        //     return "This is {TRL_NAME} with {ELEV_GAIN} ft of climbing.";
        // }

        expressionInfos: [{
            name: "elevation-ratio",
            title: "Elevation change",
            expression: "Round((($feature.ELEV_MAX - $feature.ELEV_MIN)/($feature.LENGTH_MI)/5280)*100,2)"
        }],
        content: "The {TRL_NAME} trail average slope per mile is: {expression/elevation-ratio}% over a total of {LENGTH_MI} miles."

        // content: [{
        //     type: "media",
        //     mediaInfos: [{
        //         type: "column-chart",
        //         caption: "",
        //         value: {
        //             fields: [ "ELEV_MIN","ELEV_MAX" ],
        //             normalizeField: null,
        //             tooltipField: "Min and max elevation values"
        //         }
        //     }]
        // }]
    }

    var trails = new FeatureLayer({
        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0",
        outFields: ["TRL_NAME","ELEV_GAIN"],
        popupTemplate: popupTrails
    });

    map.add(trails,0);

    var popupOpenspaces = {
        "title": "{PARK_NAME}",
        "content": [{
            "type": "fields",
            "fieldInfos": [
                {
                    "fieldName": "AGNCY_NAME",
                    "label": "Agency",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": null,
                    "stringFieldOption": "text-box"
                },
                {
                    "fieldName": "TYPE",
                    "label": "Type",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": null,
                    "stringFieldOption": "text-box"
                },
                {
                    "fieldName": "ACCESS_TYP",
                    "label": "Access",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": null,
                    "stringFieldOption": "text-box"
                },
                {
                    "fieldName": "GIS_ACRES",
                    "label": "Acres",
                    "isEditable": true,
                    "tooltip": "",
                    "visible": true,
                    "format": {
                        "places": 2,
                        "digitSeparator": true
                    },
                    "stringFieldOption": "text-box"
                }
            ]
        }]
      }

    var openspaces = new FeatureLayer({
        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space_Styled/FeatureServer/0",
        outFields: ["TYPE","PARK_NAME", "AGNCY_NAME","ACCESS_TYP","GIS_ACRES"],
        popupTemplate: popupOpenspaces
    });

    map.add(openspaces,0);
    
    // Reference the feature layer to query
    var featureLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0",
    });

    // Layer used to draw graphics returned
    var graphicsLayer = new GraphicsLayer();
    
    map.add(graphicsLayer);

    function addGraphics(result) {
        graphicsLayer.removeAll();
        result.features.forEach(function(feature){
            var g = new Graphic({
                geometry: feature.geometry,
                attributes: feature.attributes,
                symbol: {
                    type: "simple-marker",
                    color: [0,0,0],
                    outline: {
                        width: 2,
                        color: [0,255,255],
                    },
                    size: "20px"
                },
                popupTemplate: {
                    title: "{TRL_NAME}",
                    content: "This a {PARK_NAME} trail located in {CITY_JUR}."
                }
            });
            
            graphicsLayer.add(g);
        });
    }

    // server-side spatial query
    function queryFeatureLayer(point, distance, spatialRelationship, sqlExpression) {
        var query = {
            geometry: point,
            distance: distance,
            spatialRelationship: spatialRelationship,
            outFields: ["*"],
            returnGeometry: true,
            where: sqlExpression
        };
        featureLayer.queryFeatures(query).then(function(result) {
            addGraphics(result, true);
        });
    }

    // client-side spatial query
    function queryFeatureLayerView(point, distance, spatialRelationship, sqlExpression) {
        // Add the layer if it is missing
        if (!map.findLayerById(featureLayer.id)) {
            featureLayer.outFields = ["*"];
            map.add(featureLayer,0);
        }
        // Set up the query
        var query = {
            geometry: point,
            distance: distance,
            spatialRelationship: spatialRelationship,
            outFields: ["*"],
            returnGeometry: true,
            where: sqlExpression
        };
        // Wait for the layerview to be ready and then query features
        view.whenLayerView(featureLayer).then(function(featureLayerView) {
            if (featureLayerView.updating) {
                var handle = featureLayerView.watch("updating", function(isUpdating){
                    if (!isUpdating) {
                        // Execute the query
                        featureLayerView.queryFeatures(query).then(function(result) {
                          addGraphics(result)
                        });
                        handle.remove();
                    }
                });
            } else {
                // Execute the query
                featureLayerView.queryFeatures(query).then(function(result) {
                    addGraphics(result);
                });
            }
        });
    }

    // attribute query
    var sql = "TRL_NAME like '%Canyon%'";

    view.when(function(){
        //*** UPDATE ***//
        // queryFeatureLayer(view.center, 1500, "intersects"); // server-side query
        // queryFeatureLayerView(view.center, 1500, "intersects"); // client-side query
        queryFeatureLayerView(view.center, 1500, "intersects", sql) //client-side spatial and attribute query
    });

    view.on("click", function(event){
        //*** UPDATE ***//
        // queryFeatureLayer(event.mapPoint, 1500, "intersects"); // server-side query
        // queryFeatureLayerView(event.mapPoint, 1500, "intersects"); // client-side query
        queryFeatureLayerView(event.mapPoint, 1500, "intersects", sql); //client-side spatial and attribute query
    });

    //*** the following code to show a pop-up as the cursor moves. ***//
    view.when(function(){
        view.whenLayerView(featureLayer).then(function(featureLayerView) {
            view.on("pointer-move", function(event){
                view.hitTest(event).then(function(response){
                    // Only return features for the feature layer
                    var feature = response.results.filter(function (result) {
                        return result.graphic.layer === featureLayer;
                    })[0].graphic;
                    if (feature) {
                        // Show popup for new features only
                        if (!view.popup.features.length || view.popup.features.length && (view.popup.features[0].attributes.FID !== feature.attributes.FID)) {
                            view.popup.open({
                                title: feature.attributes.TRL_NAME,
                                content: "This a " + feature.attributes.PARK_NAME + " trail located in " + feature.attributes.CITY_JUR + ".",
                                location: feature.geometry
                            });
                        }
                    }
                });
            });
        });
    });

    // // layer filter
    // var featureLayer = new FeatureLayer({
    //     url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0",
    //     outFields: ["*"], // Return all fields so it can be queried client-side
    //     popupTemplate: {  // Enable a popup
    //         title: "{TRL_NAME}", // Show attribute value
    //         content: "The trail elevation gain is {ELEV_GAIN} ft."  // Display in pop-up
    //     }
    // });

    // map.add(featureLayer);
    
    // // server-side filter
    // function setFeatureLayerFilter(expression) {
    //     featureLayer.definitionExpression = expression;
    // }

    // // client-side filter
    // function setFeatureLayerViewFilter(expression) {
    //     view.whenLayerView(featureLayer).then(function(featureLayerView) {
    //         featureLayerView.filter = {
    //             where: expression
    //         };
    //     });
    // }

    // selectFilter.addEventListener('change', function (event) {
    //     // setFeatureLayerFilter(event.target.value); // server-side
    //     setFeatureLayerViewFilter(event.target.value); //client-side
    // });

});
