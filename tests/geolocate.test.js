/* eslint-env node, mocha */
import { assert, expect } from 'chai';
import fetchMock from 'fetch-mock';
import GeolocateService from '../src/geolocate';
import noIpInfoErrorMsg from '../src/utils/constants';

describe('geolocateFreeGeoIp', () => {
  const freeGeoIpRes = { country_code: 'US' };
  const freeGeoIpUSRes = {
    ip: '76.72.167.90',
    country_code: 'US',
    country_name: 'United States',
    region_code: 'PA',
    region_name: 'Pennsylvania',
    city: 'Philadelphia',
    zip_code: '19103',
    time_zone: 'America/New_York',
    latitude: 39.953,
    longitude: -75.1756,
    metro_code: 504,
  }
  const freeGeoIpBRRes = {
    ip: '52.67.148.55',
    country_code: 'BR',
    country_name: 'Brazil',
    region_code: 'SP',
    region_name: 'Sao Paulo',
    city: 'São Paulo',
    zip_code: '',
    time_zone: 'America/Sao_Paulo',
    latitude: -23.5733,
    longitude: -46.6417,
    metro_code: 0,
  }
  const freeGeoIpUndefined = '404 page not found';
  const freeGeoIpResProps = ['ip', 'country_code', 'country_name', 'region_code', 'region_name',
    'city', 'zip_code', 'time_zone', 'latitude', 'longitude', 'metro_code'];

  afterEach(() => {
    fetchMock.restore();
  });

  it('should return ipinfo json object', (done) => {
    fetchMock.get('https://freegeoip.net/json/', freeGeoIpRes);
    GeolocateService.geolocateFreeGeoIp()
      .then((response) => {
        assert.isObject(response);
        expect(response).to.have.property('country_code');
        expect(response.country_code).to.have.lengthOf(2);
        assert.strictEqual(response.country_code, 'US');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should contain properties as specified in the document', (done) => {
    fetchMock.get('https://freegeoip.net/json/76.72.167.90', freeGeoIpUSRes)
      .catch((unmatchedUrl) => {
        throw new Error(unmatchedUrl);
      });
    GeolocateService.geolocateFreeGeoIp('76.72.167.90')
      .then((response) => {
        assert.isObject(response);
        assert.containsAllKeys(response, freeGeoIpResProps);
        expect(response).to.have.property('country_code');
        expect(response.country_code).to.have.lengthOf(2);
        assert.strictEqual(response.country_code, 'US', 'returns US if given ip from United States');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should return BR for 52.67.148.55', (done) => {
    fetchMock.get('https://freegeoip.net/json/52.67.148.55', freeGeoIpBRRes)
    GeolocateService.geolocateFreeGeoIp('52.67.148.55')
      .then((response) => {
        assert.containsAllKeys(response, freeGeoIpResProps);
        expect(response).to.have.property('country_code');
        expect(response.country_code).to.have.lengthOf(2);
        assert.strictEqual(response.country_code, 'BR', 'returns BR if given ip from Brazil');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should return an error if there is no ip info', (done) => {
    fetchMock.get('https://freegeoip.net/json/123456', freeGeoIpUndefined)
    GeolocateService.geolocateFreeGeoIp('123456')
      .then((response) => {
        expect(response).to.be.an('error');
        expect(response.message).to.be.a('string');
        expect(response.message).to.equal(noIpInfoErrorMsg);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

describe('geolocateIPAPI', () => {
  const ipapiUSRes = 'US';
  const ipapiUndefined = 'Undefined';

  afterEach(() => {
    fetchMock.restore();
  });

  it('should return country code string that has length 2', async () => {
    fetchMock
      .get('https://ipapi.co/country', ipapiUSRes)
      .catch((unmatchedUrl) => {
        throw new Error(unmatchedUrl);
      });
    const response = await GeolocateService
      .geolocateIPAPI()
      .catch((err) => {
        throw err;
      });

    assert.isString(response, 'IPAPI returns country code');
    expect(response).to.be.a('string');
    expect(response).to.have.lengthOf(2);
  });

  it('should return US for 173.254.206.242', async () => {
    fetchMock
      .get('https://ipapi.co/173.254.206.242/country', ipapiUSRes)
      .catch((unmatchedUrl) => {
        throw new Error(unmatchedUrl);
      });
    const response = await GeolocateService
      .geolocateIPAPI('173.254.206.242')
      .catch((err) => {
        throw err;
      });

    assert.isString(response, 'IPAPI returns country code');
    assert.strictEqual(response, 'US', 'returns US if given ip from United States');
    expect(response).to.have.lengthOf(2);
  });

  it('should return an error if there is no ip info', async () => {
    fetchMock
      .get('https://ipapi.co/123456/country', ipapiUndefined)
      .catch((unmatchedUrl) => {
        throw new Error(unmatchedUrl);
      });
    const response = await GeolocateService
      .geolocateIPAPI('123456')
      .catch((err) => {
        throw err;
      });

    expect(response).to.be.an('error');
    expect(response.message).to.be.a('string');
    expect(response.message).to.equal(noIpInfoErrorMsg);
  });
});
