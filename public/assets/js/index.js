document.addEventListener('DOMContentLoaded', (event) => {
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
                        var coordinates = L.Polyline.fromEncoded(data.segments[i].points).getLatLngs()
                        L.polyline(
                            coordinates,
                            {
                                color: 'green',
                                weight: 5,
                                opacity: .9,
                                lineJoin: 'round'
                            }
                        ).addTo(mymap) 
                        var marker = L.marker([data.segments[i].start_latlng[0], data.segments[i].start_latlng[1]], {
                            title: data.segments[i].name
                        }).bindPopup(data.segments[i].name).addTo(mymap)
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

        mymap.on('click', () => {
            const southWestLat = mymap.getBounds()._southWest.lat;
            const southWestLng = mymap.getBounds()._southWest.lng;
            const northEastLat = mymap.getBounds()._northEast.lat;
            const northEastLng = mymap.getBounds()._northEast.lng;
            getSegments(southWestLat, southWestLng, northEastLat, northEastLng);
        })
    }
});
