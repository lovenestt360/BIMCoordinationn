// SMTP transport is deliberately isolated from the SA worker and fail-closed.
// Credentials are read at runtime; never commit secrets or log their values.
import nodemailer from 'nodemailer';
import {SENDERS} from './sa-outbound-preflight.js';
const envNames={
 'mario@klyronconsulting.cc':{user:'SA_SMTP_MARIO_USER',pass:'SA_SMTP_MARIO_PASSWORD'},
 'contact@klyronconsulting.com':{user:'SA_SMTP_CONTACT_USER',pass:'SA_SMTP_CONTACT_PASSWORD'}
};
export function senderConfig(address,env=process.env){
 const sender=SENDERS.find(s=>s.address===address);
 if(!sender)throw new Error('UNAUTHORIZED_SENDER');
 const keys=envNames[address],username=env[keys.user],password=env[keys.pass];
 if(!username||!password||username.toLowerCase()!==address)throw new Error('SENDER_CREDENTIALS_UNAVAILABLE');
 return {sender,auth:{user:username,pass:password}};
}
export function senderReadiness(env=process.env){
 return SENDERS.map(s=>({address:s.address,name:s.name,configured:!!env[envNames[s.address].user]&&!!env[envNames[s.address].pass]&&String(env[envNames[s.address].user]).toLowerCase()===s.address}));
}
// Not wired to any HTTP endpoint. The caller must perform fresh Airtable
// approval/suppression/stop checks and durable atomic quota claims first.
export async function submitApprovedMessage({senderAddress,to,subject,text,sendAuthorized=false,transportFactory=nodemailer.createTransport,env=process.env}){
 if(!sendAuthorized||env.SA_OUTREACH_LIVE_ENABLED!=='true')throw new Error('SA_SENDING_DISABLED');
 const {sender,auth}=senderConfig(senderAddress,env);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||'')||!subject?.trim()||!text?.trim())throw new Error('INVALID_MESSAGE');
 const transport=transportFactory({host:'smtp.hostinger.com',port:465,secure:true,auth});
 const result=await transport.sendMail({from:{name:sender.name,address:sender.address},to,subject,text});
 if(!result?.messageId||!result?.accepted?.some(x=>x.toLowerCase()===to.toLowerCase()))throw new Error('SMTP_ACCEPTANCE_UNCONFIRMED');
 return {sender:sender.address,recipient:to,messageId:result.messageId,accepted:true};
}
