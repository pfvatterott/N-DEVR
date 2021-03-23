document.addEventListener('DOMContentLoaded', (event) => {
    const activityList = document.getElementById("activityList");
    const totalDistanceEl = document.getElementById("totalDistance");
    const totalElevationEl = document.getElementById("totalElevation")
    let totalDistance = 0;
    let totalElevation = 0;
    let segmentGraphData = [];

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
                    console.log(data)
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
                                        console.log(segmentData)
                                        createGraph(segmentData);
                                    }))
                                })

                                // Deletes the "delete" icon before adding a new row
                                const oldDeleteButton = document.getElementById("deleteButton");
                                if (oldDeleteButton) {
                                    oldDeleteButton.remove();
                                }

                                totalDistance += (Math.round(e.target.options.metaDataDistance * 0.00062137 * 100) / 100);
                                totalElevation += (Math.round(e.target.options.metaDataElevation * 3.28084));
                                totalDistanceEl.textContent = "Total Distance: " + totalDistance + " miles";
                                totalElevationEl.textContent = "Total Elevation: " + totalElevation + " feet";

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
                                    newDeleteButton.addEventListener("click", () => {
                                        // Sets corresponding line back to orange
                                        e.target.setStyle({
                                            color: 'orange'
                                        })
                                        // removes the li element
                                        li.remove();
                                        // Adjusts total distance and elevation
                                        totalDistance -= (Math.round(e.target.options.metaDataDistance * 0.00062137 * 100) / 100);
                                        totalElevation -= (Math.round(e.target.options.metaDataElevation * 3.28084));
                                        totalDistanceEl.textContent = "Total Distance: " + totalDistance + " miles";
                                        totalElevationEl.textContent = "Total Elevation: " + totalElevation + " feet";

                                        // selects the last element in the list
                                        const lastListItem = activityList.lastElementChild;
                                        if (lastListItem) {
                                            let i = document.createElement("button")
                                            i.classList.add("fas", "fa-trash-alt", "right", "deleteButton");
                                            i.setAttribute("id", "deleteButton");
                                            lastListItem.prepend(i)
                                        }
                                    })
                                }

                                // changes line color on click
                                if (initialColor === 'green') {
                                    e.target.setStyle({
                                        color:'orange'
                                    })
                                }
                                else {
                                    e.target.setStyle({
                                        color: 'green'
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
});
