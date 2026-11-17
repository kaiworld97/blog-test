import { json, getUser } from "../../lib/util.js";

export async function onRequestGet({ request, env }) {
  return json({ user: await getUser(env, request) });
}
