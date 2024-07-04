# Carblip web app

Carblip web portal built with Angular 5.2 ( Ngrx/Rxjs)

**This setup has the following modules already installed and configured :**  
- Ngx Translate  
- Ngrx  
  - Store  
  - Effects  
  - StoreDevtools

## Note on service-worker
The starter is pre-configured to generate a service-worker (thanks to angular-cli) and the only thing you need to do if you want your app to work offline, is to set `serviceWorker` to `true` in `.angular-cli.json`.

## Note on unit testing
The starter is pre-configured to use Chromium in headless mode. If you want to change that behavior, you can simply pass the browser of your choice in `karma.conf.js`, property `browsers`.

## Note on Git Push
We have validation process to verify code quality before code is pushed.
`yarn run prettier:fix`
`yarn run lint:fix`
Make sure you run this command every time you push your work. This will ensure code is clean and readable.

<hr>

# Lint, format and IDE setup
## Prettier
Before we start digging into the architecture of this project, you have to know that *[Prettier](https://github.com/prettier/prettier)* is already setup and thus, you can format all your `.ts` and `.scss` by simply running `yarn run prettier:fix`. If you have a CI setup, you might want to run `yarn run prettier:check` to make sure every file is correctly formatted.

Also, a pre-commit hook has been setup and before you commit something, it'll check if all the file are well formatted. If you want to disable that behavior, remove `.git/hooks/pre-commit` and also the `precommit` key in `package.json`.

## Visual Studio Code
Of course, you can use your favorite editor/IDE. If you decide to use VSC, you might want to install [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template). It'll give you autocompletion and type checking into your HTML templates.

<hr>

# Environments (build-time)
## /src/environments
By default, there are 2 environments : Dev and prod. This is from `@angular/cli`. Remember to always **import in your app the `environment.ts`**, not `environment.prod.ts`.  

If you need to create others environments, create a file per environment and do not forget to list it in `/src/.angular-cli.json` / `apps.environments`.   

Based on previous works, I've added some useful variables :
 - `production` (from `@angular/cli`). You probably won't need it. The main use of this variable is to set angular to production mode or not (avoid the double cycle of change detection to make sure data haven't change. Useful only in dev mode)  
 - `urlBackend`: Use it whenever you want to make an HTTP call to your API  
 - `mock`: Wheter you want to use some mocks or fetch the real backend. To know more about that, take a look into `/src/app/core/core.module.ts` where we use dependency injection to either have the real service or the mocked one based on this env variable  
 - `httpDelay`: When you have `mock` set to true, it might be a good idea to simulate a small latency for your http requests (300~500ms)  
 - `hashLocationStrategy`: Set it to true if you want to have your URLs in the old school mode : `my-website/#/my/spa/routing`. By default set to false and thus your URLs won't have the `#` and will look like that : `my-website/my/spa/routing`  
 - `debug`: You might use this variable to print (or not) some debug information in your app. This is different than `production` variable because you might want to display some debug in production too (eg if you create another environment `e2e-prod` where you set `production` to true, so your E2E tests run the same environment that the final one but you want the debug output in case something goes wrong)

 ### Setup on Ubuntu

 ## 1. Install NVM
  1.Using curl, or wget, download the installation script. In the URL below make sure you replace v0.35.0 with the latest version of nvm.

      https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh
  
  2.Run the install script with bash.

      bash install_nvm.sh

      export NVM_DIR="$HOME/.nvm"

      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
      
      [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  3.Restart your terminal

      source ~/.bash_profile
  
  4.Verify it worked

      nvm --version

 ## 2. Install Node v9.x.x

    nvm install 9

 ## 3. Install angular/cli

  Install angular cli version 7.3.4

    sudo npm install -g @angular/cli@7.3.4

 ## 4. Install packages

    yarn

    npm install

## 5. Start Project

    ng serve