import { Hono } from "hono";
import { compareHash, compareHashWithSalt, hashString, hashStringWithSalt } from "./util/hash";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/message", (c) => {
  let salt = "gayEthan"
  let msg = "Ethan is super duper very exceptionally gay"
  let msgHash = hashString(msg)
  let msgHashSalt = hashStringWithSalt(msg, salt)

  return c.text(msg + " = "+ msgHash + " Are they really equal: "+ 
    (compareHash(msg, msgHash)? "YES" : "NO")+
    " hashed with salt compare = " + (compareHashWithSalt(msg, salt, msgHashSalt)? "YES" : "NO")
  );
  // return c.text("Ethan is super duper very exceptionally gay");
});

export default app;
