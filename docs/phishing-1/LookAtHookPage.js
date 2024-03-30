/**
 * Inherits the general onEvent method from pERCEPTIONeVENT
 */
class LookAtHookPage extends pERCEPTIONeVENT {
  constructor({ occTime, delay, perceiver, hookPage}) {
    super({occTime, delay, perceiver});
    this.hookPage = hookPage;
  }
}
LookAtHookPage.labels = {"className":"LookAtHookP"};

