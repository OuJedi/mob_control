
import App from './app';
import config from 'config';

export default class Main {

  constructor() {

    let app = new App();
    config.app = app;

    config.app.init();

    config.app.loadinProgress(progress => {
      console.log(progress + "%");
    });

    config.app.onGameReady(() => {
      console.log("100%");

      config.app.startGame(() => {
        console.log("Main::startGame callback");

      });

    });

    //START
    console.log("Main::startLoading");
    config.app.startLoading();

  }

}

//Launch
new Main();