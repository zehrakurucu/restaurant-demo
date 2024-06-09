import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrl = environment.apiUrl;
  private apiKey = environment.apiKey;

  constructor(private http: HttpClient) {}


  getRestaurants(latitude: number, longitude: number, page: number): Observable<any> {
  const headers = new HttpHeaders({
    'apiKey': this.apiKey
  });
 
  const skip = (page - 1) * 10;
  const limit = 10;

    return this.http.post(
      `${this.apiUrl}/getFeed`,
      {
        skip: skip,
        limit: limit,
        latitude: latitude,
        longitude: longitude,
      },
      { headers: headers }
    );
  }
  getCurrentLocation(): Promise<{latitude: number, longitude: number}> {
    return Geolocation.getCurrentPosition().then((position) => {
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    });
  }
}
