export interface CjaysCustomerInput { id: string; name: string; phone: string; email?: string }
export interface CjaysVehicleInput { id: string; customerId?: string; vin: string; year?: string; make?: string; model?: string; color?: string }
export interface CjaysJobInput { id: string; vehicleId: string; service: string; status?: string; price?: string; checklist?: boolean[]; notes?: string; paymentMethod?: string; paidAmount?: string; beforePhotos?: string[]; afterPhotos?: string[] }
export interface CjaysSyncInput { requestId: string; customers: CjaysCustomerInput[]; vehicles: CjaysVehicleInput[]; jobs: CjaysJobInput[] }
