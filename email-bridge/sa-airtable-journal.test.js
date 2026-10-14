import test from 'node:test';
import assert from 'node:assert/strict';
import {recordSAAttempt} from './sa-airtable-journal.js';
test('accepted outcomes log without unverified pipeline mutation',async()=>{let paths=[];const r=await recordSAAttempt({leadId:'recABC123',attemptId:'attempt-abc123456',sender:'mario@klyronconsulting.cc',outcome:'accepted',messageId:'mock',requester:async(path,opts)=>{paths.push([path,JSON.parse(opts.body)]);return {};}});assert.equal(paths.length,1);assert.equal(paths[0][1].records[0].fields['Event Type'],'SA_SEND_CONFIRMED');assert.equal(r.leadUpdated,false);});
test('uncertain outcomes do not count as sent',async()=>{let v;await recordSAAttempt({leadId:'recABC123',attemptId:'attempt-abc123457',sender:'mario@klyronconsulting.cc',outcome:'uncertain',requester:async(_p,o)=>{v=JSON.parse(o.body);return {};}});assert.equal(v.records[0].fields['Event Type'],'SA_SEND_UNCERTAIN');});
