import { CONFIG } from './config.js';

export const messagesend = { 

  send(content: string){
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method:"post",
      contentType: "application/json",
      payload: JSON.stringify({ content: content })
    }

  
  return UrlFetchApp.fetch(CONFIG.WEBHOOK_URL,options);
  }
}

function message(){
messagesend.send("test")
}

(globalThis as any).message = message;

