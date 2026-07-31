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
