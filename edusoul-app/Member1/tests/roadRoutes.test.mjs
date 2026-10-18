import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoadRouteLoader, fetchRoadRoute, parseRoadRoute, transitDirectionsUrl } from '../data/roadRoutes.js';
import { districtOrigin } from '../data/universityDistances.js';

const fixture = () => ({ code: 'Ok', routes: [{ distance: 350123, duration: 18001, geometry: { type: 'LineString', coordinates: [[80.2103,6.0461],[79.9,7.1],[80.3976,8.3551]] }, legs: [{ steps: [{ name: 'Southern Expressway', ref: 'E01', distance: 100000 }, { name: 'Southern Expressway', ref: 'E01', distance: 50000 }, { name: '', distance: 1 }, { name: 'Main Road', distance: 200122 }] }] }] });
const destination = { lat: 8.3551, lon: 80.3976 };

test('cards and map share an in-flight road request and its successful result', async () => {
  let calls = 0;
  let finish;
  const load = createRoadRouteLoader(() => { calls++; return new Promise(resolve => { finish = resolve; }); });
  const origin = districtOrigin('Ratnapura');
  const card = load(origin, destination);
  const map = load({ ...origin }, { ...destination });
  assert.equal(card, map);
  finish({ distanceKm: 76.8 });
  assert.equal((await card).distanceKm, 76.8);
  await load(origin, destination);
  assert.equal(calls, 1);
});

test('failed road requests can be retried without caching a false distance', async () => {
  let calls = 0;
  const load = createRoadRouteLoader(async () => {
    if (++calls === 1) throw new Error('offline');
    return { distanceKm: 76.8 };
  });
  const origin = districtOrigin('Ratnapura');
  await assert.rejects(load(origin, destination));
  assert.equal((await load(origin, destination)).distanceKm, 76.8);
  assert.equal(calls, 2);
});

test('many university cards request at most three road routes concurrently', async () => {
  const pending = [];
  let running = 0;
  let maximum = 0;
  const load = createRoadRouteLoader(() => new Promise(resolve => {
    running++;
    maximum = Math.max(maximum, running);
    pending.push(() => { running--; resolve({ distanceKm: 1 }); });
  }));
  const requests = Array.from({ length: 8 }, (_, i) => load(districtOrigin('Ratnapura'), { lat: 7 + i / 10, lon: 80 }));
  while (pending.length) {
    pending.shift()();
    await Promise.resolve();
    await Promise.resolve();
  }
  await Promise.all(requests);
  assert.equal(maximum, 3);
});

test('road response converts metres/seconds and longitude/latitude without confusing straight-line distance', () => {
  const result = parseRoadRoute(fixture());
  assert.equal(result.distanceKm, 350.123);
  assert.equal(result.durationMinutes, 301);
  assert.deepEqual(result.points[0], { lat:6.0461,lon:80.2103 });
  assert.equal(result.roads[0].distanceKm,150);
  assert.equal(result.roads[0].label,'Southern Expressway · E01');
  assert.equal(result.roads.length,2);
});

test('no-route and malformed responses never produce a fabricated driving estimate', () => {
  for (const data of [null,{code:'NoRoute',routes:[]},{code:'Ok',routes:[]}]) assert.throws(()=>parseRoadRoute(data));
  for (const mutate of [data=>data.routes[0].duration=-1, data=>data.routes[0].distance='350', data=>data.routes[0].geometry.coordinates[0]=[80,100]]) {
    const data=fixture(); mutate(data); assert.throws(()=>parseRoadRoute(data));
  }
});

test('route request uses Galle origin, university destination, road geometry and cancellation', async () => {
  const controller = new AbortController();
  let request;
  const result = await fetchRoadRoute(districtOrigin('Galle'),destination,{signal:controller.signal,fetchImpl:async(url,options)=>{
    request={url:new URL(url),options};return {ok:true,json:async()=>fixture()};
  }});
  assert.equal(request.url.pathname,'/route/v1/driving/80.2103,6.0461;80.3976,8.3551');
  assert.equal(request.url.searchParams.get('geometries'),'geojson');
  assert.equal(request.url.searchParams.get('steps'),'true');
  assert.equal(request.url.searchParams.get('alternatives'),'true');
  assert.equal(request.options.signal,controller.signal);
  assert.equal(result.distanceKm,350.123);
  await assert.rejects(fetchRoadRoute(null,destination));
  await assert.rejects(fetchRoadRoute(districtOrigin('Galle'),destination,{fetchImpl:async()=>({ok:false})}));
});

test('public transport link keeps the same endpoints and requests transit rather than a driving ETA', () => {
  const url=new URL(transitDirectionsUrl(districtOrigin('Galle'),destination));
  assert.equal(url.searchParams.get('origin'),'6.0461,80.2103');
  assert.equal(url.searchParams.get('destination'),'8.3551,80.3976');
  assert.equal(url.searchParams.get('travelmode'),'transit');
  assert.equal(transitDirectionsUrl(null,destination),null);
});

test('Ratnapura road requests start from Ratnapura rather than Galle', async () => {
  let requestedUrl;
  await fetchRoadRoute(districtOrigin('Ratnapura'),destination,{fetchImpl:async url=>{
    requestedUrl=new URL(url);
    return {ok:true,json:async()=>fixture()};
  }});
  assert.equal(requestedUrl.pathname,'/route/v1/driving/80.4036,6.6858;80.3976,8.3551');
  const transit=new URL(transitDirectionsUrl(districtOrigin('Ratnapura'),destination));
  assert.equal(transit.searchParams.get('origin'),'6.6858,80.4036');
});

test('the shortest returned road alternative supplies both its distance and geometry', () => {
  const data=fixture();
  const shorter=structuredClone(data.routes[0]);
  shorter.distance=90000;
  shorter.duration=20000;
  shorter.geometry.coordinates=[[80.4,6.68],[80.1,6.7],[79.89,6.81]];
  shorter.legs=[{steps:[{name:'Shorter Road',distance:90000}]}];
  data.routes.push(shorter);
  const route=parseRoadRoute(data);
  assert.equal(route.distanceKm,90);
  assert.equal(route.durationMinutes,334);
  assert.equal(route.roads[0].label,'Shorter Road');
  assert.deepEqual(route.points.at(-1),{lat:6.81,lon:79.89});
  assert.equal(route.routeCount,2);
  assert.equal(route.routeSelection,'shortest_returned_alternative');
});

test('a malformed alternative does not hide a valid route', () => {
  const data=fixture();
  data.routes.unshift({distance:1,duration:1,geometry:{type:'LineString',coordinates:[[80,100],[80,7]]}});
  const route=parseRoadRoute(data);
  assert.equal(route.distanceKm,350.123);
  assert.equal(route.routeCount,1);
});
