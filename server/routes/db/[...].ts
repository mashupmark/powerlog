/** Custom catch all route to proxy all requests to the db. This is done to add auth and prevent CORS issues */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Remove the extra path "/db" from the request
  const path = event.path.replace(/^\/db/, "");
  const target = new URL(path, config.couchDbURL).toString();

  // Proxy request to CouchDB, adding the given basic auth credentials to the request
  const credentials = btoa(`${config.couchDbUser}:${config.couchDbPassword}`);
  const res = await proxyRequest(event, target, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });
  return res;
});
