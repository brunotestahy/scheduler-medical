import { Permissions } from '../shared/models/permissions';
import { Injectable } from '@angular/core';

@Injectable()
export class PermissionsService {

  permissionArray = [];
  permsArray = [];
  obj = {};

  hasPermissions(perms: Permissions[]) {
    this.permissionArray = [];
    const me = sessionStorage.getItem('employee');

    if (me) {
      const employeeObject: any = JSON.parse(sessionStorage.getItem('employee'));
      console.log(employeeObject);
      employeeObject.user.role.permissions.map(mapper => {
        const permissionText = mapper.type + '_' + mapper.resource.name;
        this.permissionArray.push(permissionText);
      });
      perms.map(mapper => {
        const permissionText = mapper.type + '_' + mapper.name;
        this.permsArray.push(permissionText);
      });

      for (let i = 0; i < this.permsArray.length; i++) {
        this.obj[this.permsArray[i]] = this.permissionArray.indexOf(this.permsArray[i]) > -1;
      }
    }
    return this.obj;
  }

}
