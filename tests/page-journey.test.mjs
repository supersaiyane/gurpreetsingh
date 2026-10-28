import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyCoordinate,samplePose} from '../dist/page-journey.mjs';

test('journey stays continuous at section boundaries and clamps both ends',()=>{
 const stops=[100,500,900];
 assert.equal(journeyCoordinate(stops,-100),0);
 assert.equal(journeyCoordinate(stops,300),.5);
 assert.equal(journeyCoordinate(stops,500),1);
 assert.ok(Math.abs(journeyCoordinate(stops,499.999)-1)<.00001);
 assert.equal(journeyCoordinate(stops,2000),2);
});
test('journey supports a remeasured accordion layout and zero-span boundaries',()=>{
 assert.equal(journeyCoordinate([0,100,200],150),1.5);
 assert.equal(journeyCoordinate([0,100,400],150),1+1/6);
 assert.ok(Number.isFinite(journeyCoordinate([0,0,100],50)));
 assert.equal(journeyCoordinate([],100),0);
});
test('all spatial channels interpolate together without a reset at hand-off',()=>{
 const poses=[{x:2,y:0,s:1},{x:4,y:2,s:.4},{x:0,y:0,s:1}];
 assert.deepEqual(samplePose(poses,.5),{x:3,y:1,s:.7});
 assert.deepEqual(samplePose(poses,1),poses[1]);
 assert.deepEqual(samplePose(poses,-1),poses[0]);
 assert.deepEqual(samplePose(poses,50),poses[2]);
 assert.deepEqual(samplePose(poses,NaN),poses[0]);
});
