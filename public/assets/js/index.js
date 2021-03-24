document.addEventListener('DOMContentLoaded', (event) => {
    const activityList = document.getElementById("activityList");
    const totalDistanceEl = document.getElementById("totalDistance");
    const totalElevationEl = document.getElementById("totalElevation")
    let totalDistance = 0;
    let activitySegments = [];

    if (event) {
        console.info('DOM loaded');
    };

    // if map present in html, create map
    const mapTest = document.getElementById('mapid');
    if (mapTest) {
        var mymap = L.map('mapid').locate({setView: true, maxZoom: 13});
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            // hid this!!
            accessToken: 'pk.eyJ1IjoicGZ2YXR0ZXJvdHQiLCJhIjoiY2tsODZxOW5uMXo3ZTJ4bW1iN3YwbWpsaCJ9.LGIyO-vQru6dyenUYpZE3A'
        }).addTo(mymap);


        let idList = [];
        const getSegments = (southWestLat, southWestLng, northEastLat, northEastLng) =>
            fetch((`/profile/activity/${southWestLat},${southWestLng},${northEastLat},${northEastLng},`), {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                },
            }).then((response) => {
                let bounds = mymap.getBounds()
                response.json().then((data) => {
                    for (let i = 0; i < data.segments.length; i++) {
                        if (!idList.includes(data.segments[i].id)) {
                            idList.push(data.segments[i].id)
                            var coordinates = L.Polyline.fromEncoded(data.segments[i].points).getLatLngs()
                            L.polyline(
                                coordinates,
                                {
                                    color: 'orange',
                                    weight: 5,
                                    opacity: .9,
                                    lineJoin: 'round',
                                    metaDataName: data.segments[i].name,
                                    metaDataDistance: data.segments[i].distance,
                                    metaDataElevation: data.segments[i].elev_difference,
                                    metaDataId: data.segments[i].id
                                },
                            ).on('mouseover', (e) => {
                                initialColor = e.target.options.color;
                                e.target.setStyle({
                                    color: 'yellow'
                                })
                            }).on('mouseout', (e) => {
                                e.target.setStyle({
                                    color: initialColor
                                })
                            }).on('click', (e) => {

                                // Gets segment stream of coordinates, elevation, distance
                                fetch((`segment/${e.target.options.metaDataId}`), {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }).then((segmentStream) => {
                                    segmentStream.json().then((segmentData => {
                                        activitySegments.push(e.target.options.metaDataId)
                                        createGraph(segmentData);
                                    }))
                                })

                                // Deletes the "delete" icon before adding a new row
                                const oldDeleteButton = document.getElementById("deleteButton");
                                if (oldDeleteButton) {
                                    oldDeleteButton.remove();
                                }

                                totalDistance += (Math.round(e.target.options.metaDataDistance * 0.00062137 * 100) / 100);
                                totalDistanceEl.textContent = "Total Distance: " + totalDistance + " miles";

                                // Create List Item on click
                                let li = document.createElement("li");
                                let span = document.createElement("span");
                                let p1 = document.createElement("p");
                                let p2 = document.createElement("p");
                                let i = document.createElement("button");
                                i.classList.add("fas", "fa-trash-alt", "right", "deleteButton");
                                i.setAttribute("id", "deleteButton");
                                li.setAttribute('data-index', e.target.options.metaDataId);
                                li.classList.add("collection-item");
                                span.classList.add("title");
                                span.textContent = e.target.options.metaDataName
                                p1.textContent = "Distance: " + (Math.round(e.target.options.metaDataDistance * 0.00062137 * 100) / 100) + " miles";
                                p2.textContent = "Elevation: " + (Math.round(e.target.options.metaDataElevation * 3.28084)) + " feet";
                                li.appendChild(i)
                                li.appendChild(span);
                                li.appendChild(p1);
                                li.appendChild(p2);
                                activityList.appendChild(li);

                                const newDeleteButton = document.getElementById("deleteButton");
                                if (newDeleteButton){
                                    // Grabs segment data to use for deleting graph data
                                    $(document).on("click", `[data-index=${e.target.options.metaDataId}]`, function(q){
                                        this.remove()
                                        activitySegments.pop();
                                        fetch((`segment/${e.target.options.metaDataId}`), {
                                            method: 'GET',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                        }).then((segmentStream) => {
                                            segmentStream.json().then((segmentData => {
                                                console.log(segmentData)
                                                removeGraphData(segmentData);
                                            }))
                                        });

                                        // Sets corresponding line back to orange
                                        if (e.target.options.color === 'green') {
                                            e.target.setStyle({
                                                color:'orange'
                                            })
                                        }
                                        else {
                                            e.target.setStyle({
                                                color:'green'
                                            })
                                        }
                                        
                                        // Adjusts total distance
                                        totalDistance -= (Math.round(e.target.options.metaDataDistance * 0.00062137 * 100) / 100);
                                        totalDistanceEl.textContent = "Total Distance: " + totalDistance + " miles";
                                        

                                        const lastListItem = activityList.lastElementChild;
                                        if (lastListItem) {
                                            let i = document.createElement("button")
                                            i.classList.add("fas", "fa-trash-alt", "right", "deleteButton");
                                            i.setAttribute("id", "deleteButton");
                                            lastListItem.prepend(i)
                                        }
                                        q.preventDefault()
                                        q.stopPropagation();
                                    })
                                }

                                // changes line color on click
                                if (initialColor === 'orange') {
                                    e.target.setStyle({
                                        color:'green'
                                    })
                                }
                                else if (initialColor === 'green') {
                                    e.target.setStyle({
                                        color:'red'
                                    })
                                }
                                else {
                                    e.target.setStyle({
                                        color: 'orange'
                                    })
                                }
                                initialColor = e.target.options.color
                            }).addTo(mymap)
                            var marker = L.marker([data.segments[i].start_latlng[0], data.segments[i].start_latlng[1]], {
                                title: `${data.segments[i].name}`,
                            }).bindPopup('<b>' + data.segments[i].name + '</b> <br> Distance: ' + (Math.round(0.00062137 * data.segments[i].distance * 100) / 100) + ' miles <br> Elevation: ' + (Math.round(data.segments[i].elev_difference * 3.28084)) + " ft").addTo(mymap)
                        }
                    }
                })
            })
            
        mymap.on('load', () => {
            const southWestLat = mymap.getBounds()._southWest.lat;
            const southWestLng = mymap.getBounds()._southWest.lng;
            const northEastLat = mymap.getBounds()._northEast.lat;
            const northEastLng = mymap.getBounds()._northEast.lng;
            getSegments(southWestLat, southWestLng, northEastLat, northEastLng);
        })

        mymap.on('dragend', () => {
            const southWestLat = mymap.getBounds()._southWest.lat;
            const southWestLng = mymap.getBounds()._southWest.lng;
            const northEastLat = mymap.getBounds()._northEast.lat;
            const northEastLng = mymap.getBounds()._northEast.lng;
            getSegments(southWestLat, southWestLng, northEastLat, northEastLng);
        })
        
        let newGraphData = [];
        let elevationGained = 0;
        let elevationLost = 0;
        const createGraph = (data) => {
            if (newGraphData.length > 0) {
                const lastSegmentEndDistance = newGraphData[newGraphData.length - 1].x
                for (let i = 0; i < data[1].data.length; i++) {
                    let xValue = (Math.round(.00062137 * data[1].data[i] * 100) /100 ) + lastSegmentEndDistance;
                    newGraphData.push({x: xValue, y: (Math.round(3.28084 * data[2].data[i]))})  
                }
            }
            else {
                for (let i = 0; i < data[1].data.length; i++) {
                    newGraphData.push({x: (Math.round(.00062137 * data[1].data[i] * 100) /100 ), y: (Math.round(3.28084 * data[2].data[i]))})
                }
            }

            for (let i = 0; i < data[2].data.length; i++) {
                if (data[2].data[i] > data[2].data[i+1]) {
                    elevationLost += data[2].data[i] - data[2].data[i+1]
                }
                else if (data[2].data[i] < data[2].data[i+1]) {
                    elevationGained += data[2].data[i+1] - data[2].data[i]
                }    
            }
            totalElevationEl.textContent = ('Elevation Gained = ' + (Math.round(elevationGained * 3.28084)) + ' ft Elevation Lost = ' + (Math.round(elevationLost * 3.28084)) + " ft")

            renderChart();
        }

        removeGraphData = (data) => {
            // removes the amount of data from the segment from the end of the graph data
            for (let i = data[1].data.length; i > 0; i--) {
                newGraphData.pop();
                
            }

            for (let i = 0; i < data[2].data.length; i++) {
                if (data[2].data[i] > data[2].data[i+1]) {
                    elevationLost -= data[2].data[i] - data[2].data[i+1]
                }
                else if (data[2].data[i] < data[2].data[i+1]) {
                    elevationGained -= data[2].data[i+1] - data[2].data[i]
                }    
            }
            totalElevationEl.textContent = ('Elevation Gained = ' + (Math.round(elevationGained * 3.28084)) + ' ft Elevation Lost = ' + (Math.round(elevationLost * 3.28084)) + " ft")

            renderChart();
        }

        renderChart = () => {
            var chart = new CanvasJS.Chart("chartContainer", {
                animationEnabled: true,  
                title:{
                    text: "Your Ride"
                },
                toolTip: {
                    content: "Distance: {x} miles <br> Elevation: {y} feet"
                },
                axisY: {
                    title: "Elevation",
                    suffix: "ft",
                },
                axisX: {
                    title: "Distance",
                    suffix: "miles"
                },
                data: [{
                    type: "splineArea",
                    color: "rgba(54,158,173,.7)",
                    markerSize: 5,
                    dataPoints: newGraphData
                }]
                });
            chart.render();
        }
    }

    const saveActivityButton = document.getElementById('save-activity');
    if (saveActivityButton) {
        saveActivityButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(activitySegments)
            // const activityInfo = {
            //     activity_name: ,
            //     activity_description: ,
            //     elevation_gained: elevationGained,
            //     elevation_lost: elevationLost,
            //     activity_creator: ,
            //     invited_members: ,
            //     activity_segments: activitySegments,
            // }
        })
    }
});
