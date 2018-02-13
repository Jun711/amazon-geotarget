import { geolocateFreeGeoIp, geolocateIPAPI } from './geolocate/geolocate';

const whereabout = function (provider = 0) {
  if (provider > 1) {
    return Promise.reject(new Error('Service is not available'));
  }
  let response = null;
  try {
    if (provider === 0) {
      response = geolocateIPAPI();
    } else {
      response = geolocateFreeGeoIp();
    }
  } catch (err) {
    const nextProvider = provider + 1;
    whereabout(nextProvider);
  }

  return response;
};

if (typeof window !== 'undefined'
  && typeof window.whereabout === 'undefined') {
  window.whereabout = whereabout;
}

module.exports = whereabout;
