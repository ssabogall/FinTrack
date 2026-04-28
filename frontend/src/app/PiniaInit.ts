// author: Santiago Gómez Ospina

// external imports
import { createPinia } from 'pinia';

export default class PiniaInit {
  public static init() {
    const pinia = createPinia();
    pinia.state.value.auth = { currentUser: null };
    return pinia;
  }
}
