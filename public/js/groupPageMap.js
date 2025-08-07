export const initGroupMap = (posts) => {
  const mapEl = document.getElementById('group-map');
  if (!mapEl) {
    console.error('No #group-map element');
    return;
  }

  const map = new google.maps.Map(mapEl, {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });

  const bounds = new google.maps.LatLngBounds();

  posts.forEach(post => {
    const loc = post.location;
    if (loc && Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
      const [lng, lat] = loc.coordinates;        // GeoJSON order
      const pos = { lat, lng };                  // Google Maps expects {lat, lng}

      const marker = new google.maps.Marker({
        position: pos,
        map,
        title: post.user.username,
      });
      bounds.extend(pos);

      const infoHtml = `
        <div style="max-width:200px;">
          <strong>${post.user.username}</strong><br/>
          ${new Date(post.createdAt).toLocaleDateString()}<br/>
          <p style="margin:8px 0;">${post.content.slice(0, 100)}${post.content.length>100?'…':''}</p>
          <a href="/posts/${post._id}" target="_blank">View post »</a>
        </div>
      `;
      const infoWindow = new google.maps.InfoWindow({ content: infoHtml });
      marker.addListener('click', () => infoWindow.open(map, marker));
    }
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds);
  }
};