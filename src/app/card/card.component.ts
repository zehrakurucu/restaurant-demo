import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-card-component',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  restaurants: any[] = [];
  page = 1;
  latitude!: number;
  longitude!: number;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit() {
    this.loadCurrentLocationAndRestaurants();
  }

  loadCurrentLocationAndRestaurants() {
    this.restaurantService.getCurrentLocation().then((location) => {
      this.latitude = location.latitude;
      this.longitude = location.longitude;
      this.loadRestaurants();
    }).catch((error) => {
      console.error('Error getting location', error);
    });
  }

  loadRestaurants(event?: any) {
    if (this.latitude && this.longitude) {
      this.restaurantService.getRestaurants(this.latitude, this.longitude, this.page).subscribe(data => {
        const newRestaurants = data.response.map((restaurant: any) => {
          const distance = calculateDistance(
            this.latitude,
            this.longitude,
            restaurant.location.coordinates[1],    
            restaurant.location.coordinates[0]
          );
          const isOpen = this.isRestaurantOpen(restaurant);
          return { ...restaurant, distance, isOpen };
        });
        this.restaurants = [...this.restaurants, ...newRestaurants];

        if (event) {
          event.target.complete();
        }

        if (newRestaurants.length < 10) {
          event.target.disabled = true;
        }

        this.page++;
      });
    }
  }

  isRestaurantOpen(restaurant: any): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes(); 

    const workingHours = restaurant.storeInfo.workingHours.find((hours: any) => hours.day === dayOfWeek);

    if (!workingHours || workingHours.closed) {
      return false;
    }

    const [openHour, openMinute] = workingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = workingHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime;
    }

    return currentTime >= openTime && currentTime <= closeTime;
  }

  loadData(event: any) {
    this.loadRestaurants(event);
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    0.5 - Math.cos(dLat) / 2 + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    (1 - Math.cos(dLon)) / 2;

  return R * 2 * Math.asin(Math.sqrt(a));
}
