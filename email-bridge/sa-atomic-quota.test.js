import test from 'node:test';
import assert from 'node:assert/strict';
import {claimKey,reserveSend} from './sa-atomic-quota.js';
test('idempotency key is shared across both senders',()=>assert.equal(claimKey('mario@klyronconsulting.cc','recABC123','S01'),claimKey('contact@klyronconsulting.com','recABC123','S01')));
test('atomic successful reservation',async()=>{let command;const r=await reserveSend({sender:'mario@klyronconsulting.cc',leadId:'recABC123',attemptId:'attempt-abcd1234',command:async c=>{command=c;return [1,'RESERVED'];}});assert.equal(r.reserved,true);assert.equal(command[0],'EVAL');assert.equal(command[6],'20');});
test('duplicate and rate limit fail closed',async()=>{for(const reason of ['DUPLICATE','RATE_LIMIT']){const r=await reserveSend({sender:'contact@klyronconsulting.com',leadId:'recABC123',attemptId:'attempt-abcd1234',command:async()=>[0,reason]});assert.equal(r.reserved,false);assert.equal(r.reason,reason);}});
test('missing durable store prevents reservation',async()=>{await assert.rejects(()=>reserveSend({sender:'mario@klyronconsulting.cc',leadId:'recABC123',attemptId:'attempt-abcd1234'}),/ATOMIC_STORE_NOT_CONFIGURED/);});
