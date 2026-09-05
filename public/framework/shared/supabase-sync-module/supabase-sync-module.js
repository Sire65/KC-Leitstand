(function(){
  "use strict";
  const VERSION="0.1.0",TABLE="leitstand_encrypted_records";let client=null,enabled=false;
  function setClient(next){if(!next?.auth?.getUser||!next?.from)throw new Error("INVALID_SUPABASE_CLIENT");client=next;return true}
  function enable(on){enabled=!!on&&!!client;return enabled}
  async function user(){if(!enabled||!client)throw new Error("SUPABASE_SYNC_DISABLED");const result=await client.auth.getUser(),current=result?.data?.user;if(!current)throw new Error("SUPABASE_AUTH_REQUIRED");return current}
  async function push(scope,key){
    const current=await user(),record=await window.FrameworkSecureStorage?.encryptedRecord?.(scope,key);if(!record)throw new Error("LOCAL_RECORD_NOT_FOUND");
    const payload={user_id:current.id,record_id:record.id,scope:record.scope,record_key:record.key,version:record.version,algorithm:record.algorithm,iv:record.iv,ciphertext:record.ciphertext,updated_at:record.updatedAt};
    const result=await client.from(TABLE).upsert(payload,{onConflict:"user_id,record_id"});if(result?.error)throw result.error;return {pushed:true,recordId:record.id,encrypted:true};
  }
  function status(){return {version:VERSION,enabled,configured:!!client,mode:"OFFLINE_FIRST_ENCRYPTED_PAYLOAD",authRequired:true,rlsRequired:true,crossDeviceDecryption:false}}
  window.FrameworkSupabaseSync={version:VERSION,setClient,enable,push,status};
})();
