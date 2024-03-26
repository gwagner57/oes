/**
 * Inherits the general onEvent method from pERCEPTIONeVENT
 */
class LookAtHookWebpage extends pERCEPTIONeVENT {
  constructor({ occTime, delay, perceiver, pageBodyText}) {
    super({occTime, delay, perceiver});
    this.pageBodyText = pageBodyText;
  }
}
LookAtHookWebpage.labels = {"className":"ReadHookWebP"};

