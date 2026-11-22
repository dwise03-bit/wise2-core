import test from 'node:test';
import assert from 'node:assert/strict';
import {execute,configStatus} from './server.mjs';
test('status does not reveal secrets',()=>{assert.equal(configStatus().name,'WISE² Commander');assert.equal(configStatus().production_verified,false);});
test('unknown repository blocked',async()=>{await assert.rejects(execute('github_repository',{repo:'other'}),/allowlisted/);});
test('deployment disabled by default',async()=>{await assert.rejects(execute('dispatch_deployment',{repo:'wise2-core',workflow:'deploy.yml',ref:'main',approval:'x'}),/disabled/);});
test('Hermes without config reports unverified',async()=>{if(!process.env.WISE2_HERMES_HEALTH_URL)assert.deepEqual(await execute('hermes_health'),{configured:false,healthy:null});});
