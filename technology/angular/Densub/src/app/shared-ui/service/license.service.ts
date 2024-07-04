import { Injectable } from '@angular/core';
import { differenceInCalendarDays, isValid, startOfDay } from 'date-fns';
import { environment } from '../../../environments/environment';
import { JwtService } from './jwt.service';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  profileStatus = environment.PROFILE_STATUS;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) { }

  isValidLicense():Promise<any> {
    let isValidLicense = false;

    let promise = new Promise((resolve, reject) => {
      this.usersService.getUserInfo({ _id: this.jwtService.currentLoggedUserInfo._id }).toPromise().then(
        data => {
          if (data.status === 200) {
            const userData = data.data;
            if (userData.profileVerificationStatus === this.profileStatus.VERIFIED) {
              if(userData.licensesDetails.length > 0){
              userData.licensesDetails.filter((license, index) => {
                const todayDate = startOfDay(new Date());
                const expireDate = startOfDay(license.expirationDate);
                const diffDay = differenceInCalendarDays(expireDate, todayDate);
                if (diffDay > 0) {
                  userData.licensesDetails[index]['diffDay'] = diffDay;
                  isValidLicense = true;
                  resolve(isValidLicense)

                }else{
                isValidLicense =  false;
                reject(isValidLicense);
                }
              });
            }else{
              isValidLicense = true;
              resolve(isValidLicense);
            }
            } 
          } 

        }
      );
    
    
    
    });
   return promise;
 
  }

}
