export default interface VehicleInterFace {
    id: number;
    vehicle_id: number;
    url: string;
    primary_color_option_code: string;
    secondary_color_option_code: string;
    primary_rgb: string;
    secondary_rgb: string;
    width: number;
    height: number;
    shot_code: number;
    background_type: number;
    type: number;
    created_at?: Date;
    updated_at?: Date;
}