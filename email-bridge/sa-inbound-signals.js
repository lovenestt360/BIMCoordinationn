// Conservative normalization of inbound email signals.
// No mailbox polling or Airtable mutations occur in this module.
const normalize=x=>String(x||'').trim().toLowerCase();
export function classifyInbound({from='',subject='',text='',inReplyTo='',autoSubmitted='',deliveryStatus='',isBooking=false}={}){
 const sender=normalize(from),title=normalize(subject),body=normalize(text);
 if(isBooking)return {kind:'booking',stop:true};
 if(/mailer-daemon|postmaster|mail delivery subsystem/.test(sender)||/delivery status notification|undeliverable|delivery failed/.test(title)){
   if(/5\.[0-9]\.[0-9]|550|551|552|553|554|permanent failure|recipient not found|user unknown/.test(deliveryStatus+' '+body))return {kind:'hard_bounce',stop:true};
   return {kind:'delivery_notice',stop:false,requiresReview:true};
 }
 if(normalize(autoSubmitted)&&normalize(autoSubmitted)!=='no')return {kind:'automated',stop:false,requiresReview:true};
 if(/(^|\W)(unsubscribe|remove me|stop emailing|do not contact|opt out)(\W|$)/i.test(text))return {kind:'opt_out',stop:true};
 if(sender&&(/re:|reply:/i.test(subject)||inReplyTo||body))return {kind:'human_reply',stop:true};
 return {kind:'unknown',stop:false,requiresReview:true};
}
export function shouldHaltLead(f={}){
 const status=Object.fromEntries(Object.entries(f).map(([k,v])=>[k,normalize(v?.name||v)]));
 return ['opted out','unsubscribed','yes','true'].includes(status['Opt-Out Status'])||
 ['hard bounce','bounced','permanent'].includes(status['Bounce Status'])||
 ['replied','genuine reply','human reply'].includes(status['Reply Status'])||
 ['booked','scheduled','confirmed'].includes(status['Booking Status'])||
 ['stopped','paused','do not send'].includes(status['Outreach Status']);
}
