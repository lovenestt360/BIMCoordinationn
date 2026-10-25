import test from 'node:test';
import assert from 'node:assert/strict';
import {senderConfig,senderReadiness,submitApprovedMessage} from './sa-smtp-transport.js';
const env={SA_SMTP_MARIO_USER:'mario@klyronconsulting.cc',SA_SMTP_MARIO_PASSWORD:'fake-test-secret',SA_SMTP_CONTACT_USER:'contact@klyronconsulting.com',SA_SMTP_CONTACT_PASSWORD:'fake-test-secret'};
test('both distinct sender credentials are recognized',()=>{assert.ok(senderReadiness(env).every(s=>s.configured));assert.equal(senderConfig('contact@klyronconsulting.com',env).sender.name,'Klyron Consulting');});
test('unrecognized sender rejected',()=>assert.throws(()=>senderConfig('other@example.org',env),/UNAUTHORIZED_SENDER/));
test('disabled send cannot call SMTP factory',async()=>{let called=false;await assert.rejects(()=>submitApprovedMessage({senderAddress:'mario@klyronconsulting.cc',to:'recipient@example.org',subject:'Test',text:'Test',env,transportFactory:()=>{called=true;throw Error('must not call');}}),/SA_SENDING_DISABLED/);assert.equal(called,false);});
test('authorized mock transport uses correct sender identity',async()=>{let mail;const safe={...env,SA_OUTREACH_LIVE_ENABLED:'true'};const result=await submitApprovedMessage({senderAddress:'contact@klyronconsulting.com',to:'recipient@example.org',subject:'Test',text:'Test',sendAuthorized:true,env:safe,transportFactory:()=>({sendMail:async msg=>{mail=msg;return {messageId:'mock-123',accepted:['recipient@example.org']};}})});assert.equal(mail.from.name,'Klyron Consulting');assert.equal(result.messageId,'mock-123');});
