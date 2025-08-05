window.initMap = function () {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 32.0853, lng: 34.7818 }, // Tel Aviv as default
    zoom: 8,
  });

  const input = document.getElementById("locationSearch");
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo("bounds", map);

  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autocomplete.addListener("place_changed", () => {
    marker.setVisible(false);
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      alert("No details available for input: '" + place.name + "'");
      return;
    }

    // Center the map on the selected place
    map.setCenter(place.geometry.location);
    map.setZoom(14);

    // Update marker position
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    // Save coordinates to hidden inputs
    document.getElementById("locationLat").value =
      place.geometry.location.lat();
    document.getElementById("locationLng").value =
      place.geometry.location.lng();
  });
};