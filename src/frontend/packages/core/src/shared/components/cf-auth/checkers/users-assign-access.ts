import { CfAuthPrinciple } from '../principal';
import { CfAuthBaseAccess } from './base-access';
import { CFAuthResource, CFAuthChecker } from '../cf-auth.types';
export class CFAuthCheckerUser extends CfAuthBaseAccess implements CFAuthChecker {

  constructor(private principal: CfAuthPrinciple) {
    super(principal);
  }

  create(): boolean {
    return false;
  }

  /**
   * @name update
       * @description User can update a space if:
       * 1. User is an admin
       * 2. User is org manager
       * 3. user is space manager
   */
  update(spaceGuid: string, orgGuid: string, isSpace: boolean): boolean {
    // Admin
    if (super.baseUpdate()) {
      return true;
    }

    if (isSpace) {
      return super.doesContainGuid(this.principal.userSummary.organizations.managed, orgGuid) ||
        super.doesContainGuid(this.principal.userSummary.spaces.managed, spaceGuid);
    } else {
      return super.doesContainGuid(this.principal.userSummary.organizations.managed, orgGuid);
    }
  }

  delete(): boolean {
    return false;
  }

  /**
   * @name canHandle
   * @description Specifies that this ACL checker can handle `application` permission
   */
  canHandle(resource: CFAuthResource): boolean {
    return resource === CFAuthResource.user;
  }
}
