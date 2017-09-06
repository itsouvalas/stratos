import { UAASetupState } from './reducers/uaa-setup.reducers';
import { APIState } from './reducers/api.reducer';
import { AuthState } from './reducers/auth.reducer';
export interface AppState {
  api: APIState;
  auth: AuthState;
  uaaSetup: UAASetupState;
}
