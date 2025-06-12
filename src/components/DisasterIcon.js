import L from "leaflet";

/**
 * Returns a divIcon with a CSS animation based on disaster type.
 * @param {string} type - Disaster type (e.g., fire, flood, earthquake)
 * @returns {L.DivIcon}
 */
const getDisasterIcon = (type) => {
  const baseClass = "marker-effect";
  const typeClass = `marker-${type.toLowerCase()}`;
  const html = `<div class="${baseClass} ${typeClass}"></div>`;

  return L.divIcon({
    className: '', // override Leaflet default
    html,
    iconSize: [0, 0], // no default marker image
  });
};

export default getDisasterIcon;
