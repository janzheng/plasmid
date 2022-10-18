
// https://bradyjoslin.com/blog/encryption-webcrypto


// supports sveltekit crypto or browser
let _crypto

if (!_crypto) {
  try {
    _crypto = window.crypto
  } catch(e) {}
  try {
    _crypto = crypto
  } catch(e) {}

  crypto = _crypto

  if(!crypto)
    throw new Error('No crypto available')

}


const buff_to_base64 = (buff) => btoa(String.fromCharCode.apply(null, buff));

const base64_to_buf = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(null));

const enc = new TextEncoder();
const dec = new TextDecoder();

// async function encrypt() {
//   const data = document.getElementById("data").value;
//   let encryptedDataOut = document.getElementById("encryptedData");
//   const password = prompt("Password");
//   const encryptedData = await encryptData(data, password);
//   encryptedDataOut.value = encryptedData;
// }

// async function decrypt() {
//   const password = prompt("Password");
//   const encryptedData = document.getElementById("encryptedData").value;
//   let decryptedDataOut = document.getElementById("decrypted");
//   const decryptedData = await decryptData(encryptedData, password);
//   decryptedDataOut.value = decryptedData || "decryption failed!";
// }

const getPasswordKey = (password) =>
  crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);

const deriveKey = (passwordKey, salt, keyUsage) =>
  crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 250000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    keyUsage
  );


// takes a string, so needs to stringify the data
export const encryptData = async (secretData, password) => {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);
    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      enc.encode(secretData)
    );

    const encryptedContentArr = new Uint8Array(encryptedContent);
    let buff = new Uint8Array(
      salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
    );
    buff.set(salt, 0);
    buff.set(iv, salt.byteLength);
    buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
    const base64Buff = buff_to_base64(buff);
    return base64Buff;
  } catch (e) {
    console.log(`Error - ${e}`);
    return "";
  }
}

// returns a string, need to json parse
export const decryptData = async (encryptedData, password) => {
  try {
    const encryptedDataBuff = base64_to_buf(encryptedData);
    const salt = encryptedDataBuff.slice(0, 16);
    const iv = encryptedDataBuff.slice(16, 16 + 12);
    const data = encryptedDataBuff.slice(16 + 12);
    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      data
    );
    return dec.decode(decryptedContent);
  } catch (e) {
    console.log(`Error - ${e}`);
    return "";
  }
}