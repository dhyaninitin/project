export default interface BrandsInterface {
    id: number;
    name: string;
    image_url: string;
    years?:any;
    is_active?:number;
    created_at?: Date;
    updated_at?: Date;
}