document.addEventListener('DOMContentLoaded', (event) => {
    const activityId = document.getElementById('activityId').textContent;
    const participantList = document.getElementById('participantList');

    fetch((`/profile/GetActivity/${activityId}`), {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }, 
    }).then((response) => {
        response.json().then((data) => {

            console.log(data)
            // creates directions button
            const topInformationSection = document.getElementById('topInformationSection');
            const a = document.createElement('a');
            a.classList.add('waves-effect', 'waves-light', 'btn');
            const meetingCoords = data[0].activity_meeting_location.split(",");
            a.setAttribute('href', `http://maps.google.com/maps?daddr=${meetingCoords[0]},${meetingCoords[1]}`)
            a.setAttribute('target', '_blank');
            a.textContent = 'Directions';
            topInformationSection.appendChild(a)
            

            // create participant list by requesting user info from user database
            const participants = (data[0].activity_participants).split(',')
            for (let i = 0; i < participants.length; i++) {
                fetch((`/profile/searchParticipants/${participants[i]}`), {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    }, 
                }).then((participantData) => {
                    participantData.json().then((participant) => {
                        let li = document.createElement('li');
                        let img = document.createElement('img');
                        let span = document.createElement('span');
        
                        li.classList.add("collection-item", "avatar")
                        img.classList.add("circle");
                        img.setAttribute('src', participant[0].user_photo);
                        span.classList.add('title');
                        span.textContent = participant[0].user_first + " " + participant[0].user_last;
                        li.appendChild(img)
                        li.appendChild(span)
                        participantList.appendChild(li);

                    })
                })
            }

            // creating map
            const mapTest = document.getElementById('mapid');
            if (mapTest) {
                const meetingCoords = data[0].activity_meeting_location.split(",");
                var mymap = L.map('mapid').setView([+meetingCoords[0], +meetingCoords[1]], 14);
                L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 18,
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                    // hid this!!
                    accessToken: 'pk.eyJ1IjoicGZ2YXR0ZXJvdHQiLCJhIjoiY2tsODZxOW5uMXo3ZTJ4bW1iN3YwbWpsaCJ9.LGIyO-vQru6dyenUYpZE3A'
                }).addTo(mymap);
                // requesting strava API for segment info/polylines
                const activitySegments = (data[0].activity_segments).split(',')
                for (let i = 0; i < activitySegments.length; i++) {
                    fetch((`/profile/segmentInfo/${activitySegments[i]}`), {
                        method: "GET",
                        headers: {
                            'Content-Type': 'application/json',
                        },  
                    }).then((segmentData) => {
                        segmentData.json().then((segment) => {
                            var coordinates = L.Polyline.fromEncoded(segment.map.polyline).getLatLngs()
                            L.polyline(
                                coordinates,
                                {
                                    color: 'orange',
                                    weight: 5,
                                    opacity: .9,
                                    lineJoin: 'round',
                                },
                            ).addTo(mymap)
                        })
                    })
                    
                }
            }

            // get segment stream info to create chart
            const activitySegments = (data[0].activity_segments).split(',')
            let newGraphData = [];
            for (let i = 0; i < activitySegments.length; i++) {
                fetch((`/profile/segment/${activitySegments[i]}`), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then((segmentStream) => {
                    segmentStream.json().then((segmentData => {
                        if (newGraphData.length > 0) {
                            const lastSegmentEndDistance = newGraphData[newGraphData.length - 1].x
                            for (let i = 0; i < segmentData[1].data.length; i++) {
                                let xValue = (Math.round(.00062137 * segmentData[1].data[i] * 100) /100 ) + lastSegmentEndDistance;
                                newGraphData.push({x: xValue, y: (Math.round(3.28084 * segmentData[2].data[i]))})  
                            }
                        }
                        else {
                            for (let i = 0; i < segmentData[1].data.length; i++) {
                                newGraphData.push({x: (Math.round(.00062137 * segmentData[1].data[i] * 100) /100 ), y: (Math.round(3.28084 * segmentData[2].data[i]))})
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
                    }))
                })
                
            }
        })
    })

});