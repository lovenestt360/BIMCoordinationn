// Reconcile only provider-confirmed sends after an activity record exists.
// This file does not send mail or run on a schedule.
export function acceptedSAUpdate({lead,step='S01',sentAt,messageId,activityId}){
 const f=lead?.fields||lead||{};
 if(!lead?.id||!/^S(0[1-9]|10)$/.test(step)||!messageId||!activityId||!Number.isFinite(Date.parse(sentAt)))throw Error('CONFIRMATION_INCOMPLETE');
 const n=Number(step.slice(1)),old=Number(f['Last Sent Step']||0);
 if(old>=n||f['Opt-Out Status']==='Opted Out'||f['Bounce Status']==='Hard Bounce'||f['Reply Status']==='Genuine Reply'||f['Booking Status']==='Booked')return {allowed:false,reason:'STALE_OR_STOPPED'};
 if(old!==n-1) return {allowed:false,reason:'STEP_SEQUENCE_MISMATCH'};
 const fields={'Last Sent At':sentAt,'Last Sent Step':n,'Sequence Step':n,'Last Provider Message ID':messageId,'Last Activity ID':activityId};
 if(n===1)fields['S01 Sent']=true;
 // Do not force a singleSelect value or calculate follow-up date without sequence policy.
 return {allowed:true,fields};
}
