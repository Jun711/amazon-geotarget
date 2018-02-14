import amazon from 'geo-amazon';
import { geolocateFreeGeoIp, geolocateIPAPI } from './geolocate/geolocate';

async function whereabout(provider = 0) {
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
}

function amazonAffiliateURL(countryCode = 'US') {
  console.log('amazon: ', amazon.store(countryCode));
  return amazon.store(countryCode);
}

async function amazonGeotarget() {
  const response = await whereabout();
  console.log(typeof response);
  const countryCode = typeof response === 'object' ? response.country_code : response;

  return amazonAffiliateURL(countryCode);
}

export default amazonGeotarget;

export {
  amazonGeotarget,
  whereabout,
  amazonAffiliateURL,
};

if (typeof window !== 'undefined'
  && typeof window.amazonGeotarget === 'undefined') {
  window.amazonGeotarget = amazonGeotarget;
}
