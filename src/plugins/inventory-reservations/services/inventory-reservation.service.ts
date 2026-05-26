import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryReservation } from '../entities/inventory-reservation.entity';

@Injectable()
export class InventoryReservationService {
    constructor(
        @InjectRepository(InventoryReservation)
        private readonly reservationRepository: Repository<InventoryReservation>,
    ) {}

    async reserveStock(sku: string, quantity: number): Promise<InventoryReservation> {
        const reservation = this.reservationRepository.create({  quantity });
        return this.reservationRepository.save(reservation);
    }

    async releaseReservation(reservationId: number): Promise<void> {
        // Release a reservation (e.g., on order cancel)
        await this.reservationRepository.delete(reservationId);
    }

    async completeReservation(reservationId: number): Promise<void> {
        await this.reservationRepository.update(reservationId, { status: 'completed' });
    }

    async validateAvailableStock(sku: string, requestedQty: number): Promise<boolean> {
        // Validate if enough stock is available (dummy implementation)
        // You should implement actual stock check logic here
        // For now, always returns true
        return true;
    }
}
