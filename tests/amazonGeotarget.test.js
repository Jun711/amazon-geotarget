/* eslint-env node, mocha */
import { assert, expect } from 'chai';
import AmazonGeotargetService from '../src/amazonGeotarget';

describe('whereabout', () => {
  it('should call IPAPI when no provider specified', (done) => {
    AmazonGeotargetService.whereabout()
      .then((response) => {
        assert.isString(response, 'IPAPI returns country code');
        expect(response).to.be.a('string');
        expect(response).to.have.lengthOf(2);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should call IPAPI when provider 0 specified', (done) => {
    AmazonGeotargetService.whereabout(0)
      .then((response) => {
        assert.isString(response, 'IPAPI returns country code');
        expect(response).to.be.a('string');
        expect(response).to.have.lengthOf(2);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should call IPAPI when provider 0 specified', async () => {
    const response = await AmazonGeotargetService.whereabout(0).catch((err) => {
      throw err;
    });
    assert.isString(response, 'IPAPI returns country code');
    expect(response).to.be.a('string');
    expect(response).to.have.lengthOf(2);
  });

  it('should call FreeGeoIp when provider 1 specified', (done) => {
    AmazonGeotargetService.whereabout(1)
      .then((response) => {
        assert.isObject(response);
        expect(response).to.have.property('country_code');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should rejects as promised when provider 2 specified', (done) => {
    AmazonGeotargetService.whereabout(2)
      .then(() => {
        assert.fail(0, 1, 'Expected rejected promise');
        done();
      }, (err) => {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.equal('Service is not available')
        done();
      });
  });

  it('await - should rejects as promised when provider 2 specified', async () => {
    const errorHandler = function errorHandler(err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Service is not available');
    };

    const response = await AmazonGeotargetService.whereabout(2).catch(err => errorHandler(err));
    expect(response).to.be.an('undefined');
  });
});
