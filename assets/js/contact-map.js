(function () {
  const OFFICE_LOCATION = {
    lat: 37.0,
    lng: 127.0,
  };

  function createContactMap(container) {
    if (container.dataset.mapReady === "true") return;
    container.dataset.mapReady = "true";
    const center = new window.kakao.maps.LatLng(OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
    const map = new window.kakao.maps.Map(container, {
      center,
      level: 4,
    });

    new window.kakao.maps.Marker({
      position: center,
      map,
    });

    const relayout = () => {
      map.relayout();
      map.setCenter(center);
    };

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(relayout);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", relayout);
    }
  }

  function initContactMap() {
    const container = document.querySelector("#contact-map");

    if (!container || !window.kakao || !window.kakao.maps) return;

    if (typeof window.kakao.maps.load === "function") {
      window.kakao.maps.load(() => createContactMap(container));
      return;
    }

    createContactMap(container);
  }

  window.initContactMap = initContactMap;
  window.SMITU_OFFICE_LOCATION = OFFICE_LOCATION;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactMap);
  } else {
    initContactMap();
  }
})();
