// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  // angular can optimize some part of his code
  // (make more or less checks) according to an environment
  production: true,
  name: 'staging',

  // your backend URL
  // you can then use it for example in a service
  // `${environment.urlBackend}/some/resource`
  urlBackend: 'https://api-shop-staging-oke.carblip.com/apis',

  // automatically detect browser language and set it
  // as the default one
  // if this language isn't available in the app, the
  // default language specified in src/app/core/core.module.ts
  // will be used
  useBrowserLanguageAsDefault: true,

  // should you keep mocks when building the app
  // or hit the real API
  mock: false,

  // in ms
  // when using mocked data, you can use that
  // variable with `.delay` to simulate a network latency
  httpDelay: 500,

  // should the URL be
  // http://some-domain#/your/app/routes (true)
  // or
  // http://some-domain/your/app/routes (false)
  hashLocationStrategy: false,

  // by default, if you use lazy loading, your (lazy loaded)
  // modules will be loaded only when needed
  // to avoid a small latency when the user needs it, you
  // can preload them all and the browser will download
  // them when idle so they're instantly available when needed
  preloadAllLazyLoadedModules: true,

  // wether to display debug informations or not
  // TIP : Use console.debug, console.warn and console.error
  // console.log should be used only in dev and never commited
  // this way you can find every console.log very easily
  debug: true,

  // cli environments are great but sometimes you might want to
  // have a dynamic environment (at runtime)
  // if so, take a look into /assets/runtime-environments
  loadRuntimeEnvironment: false,
  segmentApiKey: 'LtKszPp8zeeK9T81jc9bai8cXafweRA7',
  enableTracking: true,
  sentry: {
    dsn: 'https://a7f9ac88a3374ed69c98abae975f493f@sentry.io/1797140',
    environment: 'staging',
    serverName: 'staging',
    sendTimeout: 5,
    ignoreErrors: [
      "Non-Error promise rejection captured",
    ]
  },
  requestTimeout: 20000,
};
