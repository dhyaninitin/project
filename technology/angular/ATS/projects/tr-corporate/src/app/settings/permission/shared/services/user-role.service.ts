import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { secure_api_routes } from '../../../../utility/configs/apiConfig';

interface IroleData {
    isView: boolean;
    isEdit: boolean;
    isNew: boolean;
    selectedRole: {
        roletypeid: number;
        rolename: string;
        accountroleid?: string
        isCustom?: boolean
    } | null
}

@Injectable({
    providedIn: 'root'
})
export class UserRoleService {
    roleData: IroleData = {
        isView: false,
        isEdit: false,
        isNew: false,
        selectedRole: null
    }
    private roleDataSource = new BehaviorSubject(this.roleData);
    currentRoleData = this.roleDataSource.asObservable();

    constructor(private http: HttpClient) {
    }

    setCurrentRole(data: IroleData) {
        this.roleDataSource.next(data)
    }

    resetSelectedRole() {
        const roleData = {
            isView: false,
            isEdit: false,
            isNew: false,
            selectedRole: null
        }

        this.setCurrentRole(roleData);
    }

    getUserRoles(accountID: string, offset: number = 0, limit: number = 10, sort?: string, sortOrder?: string,) {
        let url = `${secure_api_routes.USER_ROLES}?offset=${offset}&limit=${limit}`;
        if (sort) url = `${url}&orderby=${sort}`;
        if (sortOrder) url = `${url}&order=${sortOrder}`;

        return this.http.get<any>(url, { headers: { 'accountID': accountID } })
    }
    getTotalUserRoles() {
        const url = `${secure_api_routes.USER_ROLES}`
        return this.http.get(url);
    }

    getRole(accountroleid: number) {
        const url = `${secure_api_routes.GET_ROLE}?accountroleid=${accountroleid}`
        return this.http.get(url);
    }

    getPermissions(accountID: string, roletypeid: string) {
        const url = `${secure_api_routes.PERMISSIONS_LIST}?accountroleid=${roletypeid}`
        return this.http.get(url, { headers: { 'accountID': accountID } });
    }
    getViewpermissions(accountID: string, accountroleid: string) {
        const url = `${secure_api_routes.VIEW_PERMISSION}?accountroleid=${accountroleid}`
        return this.http.get(url, { headers: { 'accountID': accountID } });
    }
    saveRole(payload: any, accountID: string) {
        return this.http.post(secure_api_routes.ADD_ROLE, payload, { headers: { 'accountID': accountID } });
    }

    updateRole(payload: any) {
        return this.http.put(secure_api_routes.UPDATE_ROLE, payload);
    }

    updatePersmissions(payload: any, accountID: string) {
        return this.http.put(secure_api_routes.PERMISSIONS_UPDTAE, payload, { headers: { 'accountID': accountID } });
    }
    updateRolePersmissions(payload: any) {
        return this.http.put(secure_api_routes.PERMISSIONS_UPDTAE, payload);
    }

    // update permission

    update(payload: any) {
        return this.http.put(secure_api_routes.PERMISSIONS_UPDTAE, payload);
    }

    deleteRole(accountroleid: number) {
        const url = `${secure_api_routes.DELETE_ROLE}?accountroleid=${accountroleid}`;
        return this.http.patch(url, {});
    }


    // get all Default Roles 

    getAllDefaultRoles() {
        return this.http.get<any>(secure_api_routes.DEFAULT_ROLES)
    }

}
