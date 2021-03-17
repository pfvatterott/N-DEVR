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

        function getSegments(res) {
            console.log(res)
            let activityType = "biking"; 
            const segmentsLink = `https://www.strava.com/segments/explore/search?bounds=52.0457%2C5.2563%2C52.1722%2C5.5845&zoom=12&min_cat=0&max_cat=5&activity_type=cycling&access_token=${res.access_token}`
            fetch(segmentsLink).then((res) => console.log(res.json()))
        }

        const auth_link = "https://www.strava.com/oauth/token"
        function getAuthorizeToken() {
            fetch(auth_link, {
                method: 'post',

                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: '61557',
                    client_secret: '499fb5092dba14ad70ed8ac75c372d30311438cd',
                    refresh_token: '36cd7ff81b9ef362148f5b3622c5037c91bcfdc0',
                    grant_type: 'refresh-token'
                })
            }).then(res => res.json()).then(res => getSegments(res))
        }
        getAuthorizeToken();
    }

});
