import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest as observableCombineLatest, Observable } from 'rxjs';
import { filter, first, map, skipWhile, withLatestFrom } from 'rxjs/operators';

import { RouterNav } from '../../../store/src/actions/router.actions';
import { AppState, IRequestEntityTypeState } from '../../../store/src/app-state';
import { AuthState } from '../../../store/src/reducers/auth.reducer';
import {
  endpointEntitiesSelector,
  endpointsEntityRequestDataSelector,
  endpointStatusSelector,
} from '../../../store/src/selectors/endpoint.selectors';
import { EndpointModel, EndpointState } from '../../../store/src/types/endpoint.types';
import { EndpointHealthCheck, EndpointHealthChecks } from '../../endpoints-health-checks';
import { UserService } from './user.service';
import { entityCatalogue } from './entity-catalogue/entity-catalogue.service';



@Injectable()
export class EndpointsService implements CanActivate {

  endpoints$: Observable<IRequestEntityTypeState<EndpointModel>>;
  haveRegistered$: Observable<boolean>;
  haveConnected$: Observable<boolean>;
  disablePersistenceFeatures$: Observable<boolean>;

  static getLinkForEndpoint(endpoint: EndpointModel): string {
    if (!endpoint) {
      return '';
    }
    const ext = entityCatalogue.getEndpoint(endpoint.cnsi_type, endpoint.sub_type);
    const metadata = ext.builder.getMetadata(endpoint);
    if (ext) {
      return ext.builder.getLink(metadata);
    }
    return '';
  }

  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private endpointHealthChecks: EndpointHealthChecks,

  ) {
    this.endpoints$ = store.select(endpointEntitiesSelector);
    this.haveRegistered$ = this.endpoints$.pipe(map(endpoints => !!Object.keys(endpoints).length));
    this.haveConnected$ = this.endpoints$.pipe(map(endpoints =>
      !!Object.values(endpoints).find(endpoint => {
        const epType = entityCatalogue.getEndpoint(endpoint.cnsi_type, endpoint.sub_type);
        if (!epType.entity) {
          return false;
        }
        const epEntity = epType.entity;
        return epEntity.unConnectable ||
          endpoint.connectionStatus === 'connected' ||
          endpoint.connectionStatus === 'checking';
      }))
    );

    this.disablePersistenceFeatures$ = this.store.select('auth').pipe(
      map((auth) => auth.sessionData &&
        auth.sessionData['plugin-config'] &&
        auth.sessionData['plugin-config'].disablePersistenceFeatures === 'true'
      )
    );
  }

  public registerHealthCheck(healthCheck: EndpointHealthCheck) {
    this.endpointHealthChecks.registerHealthCheck(healthCheck);
  }

  public checkEndpoint(endpoint: EndpointModel) {
    this.endpointHealthChecks.checkEndpoint(endpoint);
  }

  public checkAllEndpoints() {
    this.endpoints$.pipe(first()).subscribe(endpoints => Object.keys(endpoints).forEach(guid => this.checkEndpoint(endpoints[guid])));
  }

  canActivate(route: ActivatedRouteSnapshot, routeState: RouterStateSnapshot): Observable<boolean> {
    // Reroute user to endpoint/no endpoint screens if there are no connected or registered endpoints
    return observableCombineLatest(
      this.store.select('auth'),
      this.store.select(endpointStatusSelector)
    ).pipe(
      skipWhile(([state, endpointState]: [AuthState, EndpointState]) => {
        return !state.loggedIn || endpointState.loading;
      }),
      withLatestFrom(
        this.haveRegistered$,
        this.haveConnected$,
        this.userService.isAdmin$,
        this.disablePersistenceFeatures$
      ),
      map(([state, haveRegistered, haveConnected, isAdmin, disablePersistenceFeatures]
        : [[AuthState, EndpointState], boolean, boolean, boolean, boolean]) => {
        const [authState] = state;
        if (authState.sessionData.valid) {
          // Redirect to endpoints if there's no connected endpoints
          let redirect: string;
          if (!disablePersistenceFeatures) {
            if (!haveRegistered) {
              redirect = isAdmin ? '/endpoints' : '/noendpoints';
            } else if (!haveConnected) {
              redirect = '/endpoints';
            }
          }

          // Abort redirect if there's no redirect needed (endpoints are ok or we're already heading to redirect)
          if (!redirect || redirect === routeState.url) {
            return true;
          }

          this.store.dispatch(new RouterNav({ path: [redirect] }, null));
        }

        return false;
      }));
  }

  hasMetrics(endpointId: string) {
    return this.store.select(endpointsEntityRequestDataSelector(endpointId)).pipe(
      filter(endpoint => !!endpoint),
      map(endpoint => endpoint.metricsAvailable),
      first()
    );
  }

  doesNotHaveConnectedEndpointType(type: string): Observable<boolean> {
    return this.connectedEndpointsOfTypes(type).pipe(
      map(eps => eps.length === 0)
    );
  }

  hasConnectedEndpointType(type: string): Observable<boolean> {
    return this.connectedEndpointsOfTypes(type).pipe(
      map(eps => eps.length > 0)
    );
  }

  connectedEndpointsOfTypes(type: string): Observable<EndpointModel[]> {
    return this.endpoints$.pipe(
      map(ep => {
        return Object.values(ep)
          .filter(endpoint => {
            const epType = entityCatalogue.getEndpoint(endpoint.cnsi_type, endpoint.sub_type).entity;
            return endpoint.cnsi_type === type && (epType.unConnectable || endpoint.connectionStatus === 'connected');
          });
      })
    );
  }
}
