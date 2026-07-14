export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("[ServiceWorker] Registered successfully:", registration.scope)

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[ServiceWorker] New content available, please refresh")
                  window.dispatchEvent(new CustomEvent("sw-update-available"))
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("[ServiceWorker] Registration failed:", error)
        })
    })

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[ServiceWorker] Controller changed, reloading page")
      window.location.reload()
    })
  }
}

export function unregisterServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
        console.log("[ServiceWorker] Unregistered")
      })
      .catch((error) => {
        console.error("[ServiceWorker] Unregistration failed:", error)
      })
  }
}
