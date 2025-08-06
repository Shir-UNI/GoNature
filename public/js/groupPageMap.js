export const initGroupMap = (posts) => {
  const mapEl = document.getElementById('group-map');
  const map = new google.maps.Map(mapEl, {
    center: { lat: 0, lng: 0 },
    zoom: 2
  });

  const bounds = new google.maps.LatLngBounds();

  posts.forEach(p => {
    if (p.location && p.location.lat && p.location.lng) {
      const pos = { lat: p.location.lat, lng: p.location.lng };
      new google.maps.Marker({ position: pos, map });
      bounds.extend(pos);
    }
  });

  if (!bounds.isEmpty()) map.fitBounds(bounds);
};
