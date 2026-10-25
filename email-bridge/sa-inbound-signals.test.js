import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyInbound,shouldHaltLead} from './sa-inbound-signals.js';
test('permanent bounce pauses recipient',()=>assert.deepEqual(classifyInbound({from:'MAILER-DAEMON@example.com',subject:'Delivery failed',deliveryStatus:'550 5.1.1 user unknown'}),{kind:'hard_bounce',stop:true}));
test('reply and opt-out stop outreach',()=>{assert.equal(classifyInbound({from:'person@example.com',subject:'Re: A question',text:'Thanks for your note'}).stop,true);assert.equal(classifyInbound({from:'person@example.com',text:'Please unsubscribe'}).kind,'opt_out');});
test('auto-replies are not assumed to be human',()=>assert.equal(classifyInbound({from:'person@example.com',text:'Away',autoSubmitted:'auto-replied'}).kind,'automated'));
test('lead stop flags enforce pauses',()=>{for(const fields of [{'Reply Status':'Replied'},{'Opt-Out Status':'Unsubscribed'},{'Bounce Status':'Hard Bounce'},{'Booking Status':'Booked'},{'Outreach Status':'Paused'}])assert.equal(shouldHaltLead(fields),true);assert.equal(shouldHaltLead({'Outreach Status':'Not started'}),false);});
