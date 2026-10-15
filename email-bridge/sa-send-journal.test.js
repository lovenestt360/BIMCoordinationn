import test from 'node:test';
import assert from 'node:assert/strict';
import {recordOutcome,readOutcome} from './sa-send-journal.js';
test('journal append is immutable',async()=>{const map=new Map();const command=async a=>{if(a[0]==='SET'){if(map.has(a[1]))return null;map.set(a[1],a[2]);return 'OK';}return map.get(a[1])||null;};const params={attemptId:'attempt-123456',leadId:'recABC123',sender:'mario@klyronconsulting.cc',step:'S01',outcome:'accepted',messageId:'test-id',command};assert.equal((await recordOutcome(params)).stored,true);assert.equal((await recordOutcome({...params,outcome:'failed'})).stored,false);assert.equal((await readOutcome({attemptId:params.attemptId,command})).outcome,'accepted');});
test('unknown outcome refused',async()=>{await assert.rejects(()=>recordOutcome({attemptId:'attempt-123456',leadId:'recABC123',outcome:'oops'}),/INVALID_OUTCOME/);});
