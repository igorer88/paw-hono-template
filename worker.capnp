# Self-hosted runtime config used by the Dockerfile (workerd) — an alternative
# to the default Cloudflare Workers deployment. This is a static config: bindings
# are hardcoded below. Allowed origins is empty (CORS denies all) and ENVIRONMENT
# is production — adjust per deployment before building the image.
using Workerd = import "/workerd/workerd.capnp";

const config :Workerd.Config = (
  services = [
    (name = "main", worker = .worker),
  ],
  sockets = [
    (service = "main", name = "http", address = "*:8080", http = ()),
  ]
);

const worker :Workerd.Worker = (
  modules = [
    (name = "main", esModule = embed "dist/index.js"),
  ],
  compatibilityDate = "2026-07-28",
  compatibilityFlags = ["nodejs_compat"],
  bindings = [
    (name = "ENVIRONMENT", value = "production"),
    (name = "ALLOWED_ORIGIN", value = ""),
    (name = "LOGGER_LEVELS", value = "info"),
    (name = "IP_LOG_LEVEL", value = "partial"),
  ],
);
