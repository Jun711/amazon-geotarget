/* eslint-env node, mocha */
import { assert, expect } from 'chai';
import { stub } from 'sinon';
import amazon from 'geo-amazon';
import fetchMock from 'fetch-mock';
import GeolocateService from '../src/geolocate';
import AmazonGeotargetService from '../src/amazonGeotarget';

describe('fn whereabout', () => {
  describe('mock IP services', () => {
    let geolocateIpapiStub;
    let geolocateFreeGeoIpStub;
    const ipapiRes = 'US';
    const freeGeoIpRes = { country_code: 'US' };

    beforeEach(() => {
      geolocateIpapiStub = stub(GeolocateService, 'geolocateIPAPI').resolves(ipapiRes)
      geolocateFreeGeoIpStub = stub(GeolocateService, 'geolocateFreeGeoIp').resolves(freeGeoIpRes);
    });

    afterEach(() => {
      geolocateIpapiStub.restore();
      geolocateFreeGeoIpStub.restore();
    });

    function providerZeroTest(response) {
      expect(geolocateIpapiStub.calledOnce).to.equal(true);
      expect(geolocateFreeGeoIpStub.notCalled).to.equal(true);
      expect(response).to.be.a('string');
      expect(response).to.have.lengthOf(2);
      expect(response).to.equal('US');
    }

    it('whereabout should call IPAPI when no provider specified', (done) => {
      AmazonGeotargetService.whereabout()
        .then((response) => {
          providerZeroTest(response);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('whereabout should call IPAPI when provider 0 specified', (done) => {
      AmazonGeotargetService.whereabout({ provider: 0 })
        .then((response) => {
          providerZeroTest(response);
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('whereabout should call IPAPI when provider 0 specified - async await', async () => {
      const response = await AmazonGeotargetService.whereabout({ provider: 0 }).catch((err) => {
        throw err;
      });
      providerZeroTest(response);
    });

    it('whereabout should call FreeGeoIp when provider 1 specified', (done) => {
      AmazonGeotargetService.whereabout({ provider: 1 })
        .then((response) => {
          assert.isObject(response);
          expect(response).to.have.property('country_code');
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it('whereabout should rejects as promised when provider 2 specified', (done) => {
      AmazonGeotargetService.whereabout({ provider: 2 })
        .then(() => {
          assert.fail(0, 1, 'Expected rejected promise');
          done();
        }, (err) => {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.equal('Service is not available')
          done();
        });
    });

    it('await - whereabout should rejects as promised when provider 2 specified', async () => {
      const errorHandler = function errorHandler(err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal('Service is not available');
      };

      const response = await AmazonGeotargetService.whereabout({ provider: 2 })
        .catch(err => errorHandler(err));
      expect(response).to.be.an('undefined');
    });
  });

  describe('mock fetch using fetch-mock', () => {
    const ipapiRes = 'US';
    const ipapiUndefined = 'Undefined';
    const freeGeoIpRes = { country_code: 'US' };

    it('whereabout should returns US using provider 0 and IP from US is specified', async () => {
      fetchMock.get('https://ipapi.co/76.72.167.90/country', ipapiRes);
      const response = await AmazonGeotargetService.whereabout({
        provider: 0,
        ip: '76.72.167.90',
      }).catch((err) => {
        throw err;
      });
      assert.isDefined(response, 'Response is defined')
      assert.isString(response, 'IPAPI returns country code');
      assert.strictEqual(response, 'US');
      fetchMock.restore();
    });

    it('whereabout should returns US using provider 0 and IP is non-existent', async () => {
      // geolocateIPAPI response when IP is not found
      fetchMock.get('https://ipapi.co/1234567/country', ipapiUndefined);
      const response = await AmazonGeotargetService.whereabout({
        provider: 0,
        ip: '1234567',
      }).catch((err) => {
        throw err;
      });
      assert.strictEqual(response, undefined);
      assert.notExists(response); // null or undefined
      assert.isUndefined(response);
      fetchMock.restore();
    });

    it('whereabout should returns US using provider 1 and IP from US is specified', async () => {
      fetchMock.get('https://freegeoip.net/json/50.23.94.74', freeGeoIpRes);
      const response = await AmazonGeotargetService.whereabout({
        provider: 1,
        ip: '50.23.94.74',
      }).catch((err) => {
        throw err;
      });
      expect(response.country_code).to.be.a('string');
      expect(response.country_code).to.have.lengthOf(2);
      assert.strictEqual(response.country_code, 'US');
      fetchMock.restore();
    });

    it('whereabout should returns US using provider 1 and IP is non-existent', async () => {
      // freegeoip response when IP is not found
      fetchMock.get('https://freegeoip.net/json/1234567', ' 404 page not found');
      const response = await AmazonGeotargetService.whereabout({
        provider: 1,
        ip: '1234567',
      }).catch((err) => {
        throw err;
      });
      assert.strictEqual(response, undefined);
      assert.notExists(response); // null or undefined
      assert.isUndefined(response);
      fetchMock.restore();
    });
  });
});

describe('fn amazonAffiliateURL', () => {
  it('amazonAffiliateURL should return www.amazon.com when no country specified', () => {
    const response = AmazonGeotargetService.amazonAffiliateURL()
    assert.strictEqual(response, 'www.amazon.com');
    assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
    expect(response).to.be.a('string');
  });

  it('amazonAffiliateURL should return www.amazon.com when non-existent country specified', () => {
    const response = AmazonGeotargetService.amazonAffiliateURL('ABC')
    assert.strictEqual(response, 'www.amazon.com');
    assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
    expect(response).to.be.a('string');
  });

  it('amazonAffiliateURL should return www.amazon.co.uk when GB specified', () => {
    const response = AmazonGeotargetService.amazonAffiliateURL('GB')
    assert.strictEqual(response, 'www.amazon.co.uk');
    assert.isString(response, 'amazonAffiliateURL returns www.amazon.co.uk');
    expect(response).to.be.a('string');
  });

  it('amazonAffiliateURL should return www.amazon.co.jp when JP specified', () => {
    const response = AmazonGeotargetService.amazonAffiliateURL('JP')
    assert.strictEqual(response, 'www.amazon.co.jp');
    assert.isString(response, 'amazonAffiliateURL returns www.amazon.co.jp');
    expect(response).to.be.a('string');
  });

  it('amazonAffiliateURL should return www.amazon.de when DE specified', () => {
    const response = AmazonGeotargetService.amazonAffiliateURL('DE')
    assert.strictEqual(response, 'www.amazon.de');
    assert.isString(response, 'amazonAffiliateURL returns www.amazon.de');
    expect(response).to.be.a('string');
  });
})

describe('fn amazonGeotarget', () => {
  describe('real service', () => {
    it('amazonGeotarget real service should return US Amazon store URL using IP 199.87.228.66', async () => {
      const response = await AmazonGeotargetService.amazonGeotarget('199.87.228.66').catch((err) => {
        throw err;
      });
      assert.isString(response, 'amazonGeotarget returns Amazon store URL');
      assert.strictEqual(response, 'www.amazon.com');
      expect(response).to.be.a('string');
    });
  });

  describe('stub geolocate', () => {
    it('amazonGeotarget should return US Amazon store URL using non-existent IP', async () => {
      const geolocateIpapiStub = stub(GeolocateService, 'geolocateIPAPI').resolves('Undefined');
      const response = await AmazonGeotargetService.amazonGeotarget('1234567').catch((err) => {
        throw err;
      });
      expect(geolocateIpapiStub.calledOnce).to.equal(true);
      assert.isString(response, 'amazonGeotarget returns Amazon store URL');
      assert.strictEqual(response, 'www.amazon.com');
      expect(response).to.be.a('string');
      geolocateIpapiStub.restore();
    });

    it('amazonGeotarget should return US Amazon if user is in US', async () => {
      const geolocateIpapiStub = stub(GeolocateService, 'geolocateIPAPI').resolves('US');
      const response = await AmazonGeotargetService.amazonGeotarget().catch((err) => {
        throw err;
      });
      expect(geolocateIpapiStub.calledOnce).to.equal(true);
      assert.isString(response, 'amazonGeotarget returns Amazon store URL');
      assert.strictEqual(response, 'www.amazon.com');
      expect(response).to.be.a('string');
      geolocateIpapiStub.restore();
    });
  });

  describe('stub amazonStore and geolocate ', () => {
    let amazonStoreStub;
    let whereaboutStub;

    before(() => {
      amazonStoreStub = stub(amazon, 'store').returns('ABC');
      whereaboutStub = stub(AmazonGeotargetService, 'whereabout').resolves('JP');
    });

    it('amazonGeotarget should return www.amazon.com when amazon.store returns non Amazon URL', async () => {
      const response = await AmazonGeotargetService.amazonGeotarget('199.87.228.66');
      expect(whereaboutStub.calledOnce).to.equal(true);
      expect(amazonStoreStub.calledOnce).to.equal(true);
      assert.strictEqual(response, 'www.amazon.com');
      assert.isString(response, 'amazonAffiliateURL returns www.amazon.com');
      expect(response).to.be.a('string');
      amazonStoreStub.restore();
      whereaboutStub.restore();
    });
  });
});