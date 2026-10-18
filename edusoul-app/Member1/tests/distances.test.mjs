import test from 'node:test';
import assert from 'node:assert/strict';
import origins from '../data/districtOrigins.json' with { type: 'json' };
import { ALL_DISTRICTS } from '../data/advisorIntakeData.js';
import { districtOrigin, straightLineDistanceKm, validCoordinates, universityDistanceRows, drivingDirectionsUrl, resolveUniversityCoordinates } from '../data/universityDistances.js';
import stateCatalog from '../data/stateUniversities.json' with { type: 'json' };

const colombo = { name: 'University of Colombo', coordinates: { lat: 6.9022, lon: 79.8598 } };
const matara = { name: 'University of Ruhuna', coordinates: { lat: 5.9387, lon: 80.5753 } };

test('every selectable district has a sourced representative town', () => {
  assert.equal(Object.keys(origins.districts).length, 25);
  for (const district of ALL_DISTRICTS) {
    const origin = districtOrigin(district);
    assert.ok(validCoordinates(origin), district);
    assert.ok(Number.isInteger(origin.geonames_id));
    assert.equal(origin.district, district);
  }
  assert.equal(districtOrigin(' galle ').district, 'Galle');
  assert.equal(districtOrigin('Unknown'), null);
  assert.equal(districtOrigin(undefined), null);
});

test('straight-line calculation handles known distances, symmetry and zero', () => {
  assert.equal(straightLineDistanceKm({lat:0,lon:0},{lat:0,lon:0}),0);
  assert.ok(Math.abs(straightLineDistanceKm({lat:0,lon:0},{lat:0,lon:1}) - 111.195) < 0.001);
  const galle = districtOrigin('Galle');
  const distance = straightLineDistanceKm(galle,colombo.coordinates);
  assert.ok(distance>95 && distance<110);
  assert.equal(distance,straightLineDistanceKm(colombo.coordinates,galle));
  assert.ok(straightLineDistanceKm(galle,matara.coordinates)<distance);
  assert.equal(straightLineDistanceKm(null,colombo.coordinates),null);
  assert.equal(straightLineDistanceKm(galle,{lat:NaN,lon:80}),null);
  assert.equal(straightLineDistanceKm(galle,{lat:91,lon:80}),null);
  assert.equal(straightLineDistanceKm(galle,{lat:'',lon:80}),null);
});

test('selected district drives distance and nearest-first order without mutating results', () => {
  const list=[colombo,matara,{...colombo},{name:'Missing coordinates'}];
  const before=JSON.stringify(list);
  const galle=universityDistanceRows(list,'Galle');
  assert.equal(galle.length,3);
  assert.equal(galle[0].name,'University of Ruhuna');
  assert.equal(galle.at(-1).distanceKm,null);
  const colomboRows=universityDistanceRows(list,'Colombo');
  assert.equal(colomboRows[0].name,'University of Colombo');
  assert.notEqual(galle.find(row=>row.name===colombo.name).distanceKm,colomboRows[0].distanceKm);
  assert.ok(universityDistanceRows(list,'Unknown').every(row=>row.distanceKm===null));
  assert.equal(JSON.stringify(list),before);
});

test('driving directions carry the selected origin and exact university coordinates', () => {
  const origin=districtOrigin('Galle');
  const url=new URL(drivingDirectionsUrl(origin,colombo.coordinates));
  assert.equal(url.searchParams.get('origin'),`${origin.lat},${origin.lon}`);
  assert.equal(url.searchParams.get('destination'),'6.9022,79.8598');
  assert.equal(url.searchParams.get('travelmode'),'driving');
  assert.equal(drivingDirectionsUrl(null,colombo.coordinates),null);
});

test('sourced campus locations repair old saved results with missing or stale coordinates', () => {
  const kdu={name:'General Sir John Kotelawala Defence University',coordinates:null};
  const point=resolveUniversityCoordinates(kdu);
  assert.ok(validCoordinates(point));
  assert.ok(point.lat>6.81&&point.lat<6.83);
  assert.deepEqual(resolveUniversityCoordinates({...kdu,coordinates:{lat:7.048,lon:79.894}}),point);
  assert.equal(kdu.coordinates,null);
  const rows=universityDistanceRows([kdu],'Ratnapura');
  assert.ok(rows[0].distanceKm>50&&rows[0].distanceKm<80);
  assert.deepEqual(rows[0].coordinates,point);
  assert.equal(resolveUniversityCoordinates({name:'Unknown university',coordinates:null}),null);
  for(const university of stateCatalog.universities.filter(uni=>uni.coordinate_source)) {
    assert.ok(validCoordinates(resolveUniversityCoordinates({name:university.name,coordinates:null})),university.name);
    assert.ok(university.coordinate_source.startsWith('https://'));
  }
  assert.ok(validCoordinates(resolveUniversityCoordinates({name:'University of Buddhist and Pali',coordinates:null})));
});
