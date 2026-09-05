(function(){
  "use strict";
  const VERSION="0.1.0",DB_NAME="leitstand-secure-v1",DB_VERSION=1,RECORDS="records",KEYS="keys",DEVICE_KEY="device-aes-gcm-v1";
  const encoder=new TextEncoder(),decoder=new TextDecoder();
  const request=req=>new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
  const transactionDone=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error("TRANSACTION_ABORTED"))});
  const bytes=value=>value instanceof Uint8Array?value:new Uint8Array(value);
  function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(RECORDS))db.createObjectStore(RECORDS,{keyPath:"id"});if(!db.objectStoreNames.contains(KEYS))db.createObjectStore(KEYS,{keyPath:"id"})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
  let dbPromise=openDb(),keyPromise=null;
  async function deviceKey(){
    if(keyPromise)return keyPromise;
    keyPromise=(async()=>{const db=await dbPromise,readTx=db.transaction(KEYS,"readonly"),stored=await request(readTx.objectStore(KEYS).get(DEVICE_KEY));await transactionDone(readTx);if(stored?.key)return stored.key;const key=await crypto.subtle.generateKey({name:"AES-GCM",length:256},false,["encrypt","decrypt"]),writeTx=db.transaction(KEYS,"readwrite");writeTx.objectStore(KEYS).put({id:DEVICE_KEY,key,createdAt:new Date().toISOString(),extractable:false});await transactionDone(writeTx);return key})();return keyPromise;
  }
  const recordId=(scope,key)=>`${scope}:${key}`,aad=(scope,key)=>encoder.encode(`leitstand-secure-v1|${scope}|${key}`);
  async function seal(scope,key,value){
    const iv=crypto.getRandomValues(new Uint8Array(12)),plain=encoder.encode(JSON.stringify(value)),cryptoKey=await deviceKey(),cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:aad(scope,key)},cryptoKey,plain);
    return {id:recordId(scope,key),scope,key,version:1,algorithm:"AES-GCM-256",iv:Array.from(iv),ciphertext:Array.from(new Uint8Array(cipher)),updatedAt:new Date().toISOString(),syncState:"local"};
  }
  async function unseal(record){if(!record)return null;const cryptoKey=await deviceKey(),plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:bytes(record.iv),additionalData:aad(record.scope,record.key)},cryptoKey,bytes(record.ciphertext));return JSON.parse(decoder.decode(plain))}
  async function set(scope,key,value){const record=await seal(scope,key,value),db=await dbPromise,tx=db.transaction(RECORDS,"readwrite");tx.objectStore(RECORDS).put(record);await transactionDone(tx);return {scope,key,updatedAt:record.updatedAt}}
  async function get(scope,key){const db=await dbPromise,tx=db.transaction(RECORDS,"readonly"),record=await request(tx.objectStore(RECORDS).get(recordId(scope,key)));await transactionDone(tx);return unseal(record)}
  async function remove(scope,key){const db=await dbPromise,tx=db.transaction(RECORDS,"readwrite");tx.objectStore(RECORDS).delete(recordId(scope,key));await transactionDone(tx)}
  async function encryptedRecord(scope,key){const db=await dbPromise,tx=db.transaction(RECORDS,"readonly"),record=await request(tx.objectStore(RECORDS).get(recordId(scope,key)));await transactionDone(tx);return record?Object.assign({},record):null}
  async function migrateLocalStorage(scope,key,legacyKey,validate){
    const raw=localStorage.getItem(legacyKey);if(raw==null)return {migrated:false,reason:"NO_LEGACY_VALUE"};let value;try{value=JSON.parse(raw)}catch(_){return {migrated:false,reason:"INVALID_JSON"}}if(validate&&!validate(value))return {migrated:false,reason:"VALIDATION_FAILED"};
    await set(scope,key,value);const verified=await get(scope,key);if(JSON.stringify(verified)!==JSON.stringify(value))throw new Error("MIGRATION_VERIFY_FAILED");localStorage.removeItem(legacyKey);return {migrated:true};
  }
  async function ready(){await dbPromise;await deviceKey();return true}
  const api={version:VERSION,mode:"INDEXEDDB_AES_GCM",ready,set,get,remove,encryptedRecord,migrateLocalStorage,capabilities:()=>({indexedDB:true,encryption:"AES-GCM-256",deviceKeyExtractable:false,cloudPayload:"ciphertext-only"})};
  window.FrameworkSecureStorage=api;ready().then(()=>window.dispatchEvent(new CustomEvent("leitstand:secure-storage-ready"))).catch(error=>window.dispatchEvent(new CustomEvent("leitstand:secure-storage-error",{detail:{message:error.message}})));
})();
