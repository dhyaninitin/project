export default interface ModelInterface {
    id: number;
    name: string;
    brand_id: number;
    sub_brand_id: number;
    year: number;
    msrp: number;
    image_url: string;
    image_url_320: string;
    image_url_640: string;
    image_url_1280: string;
    image_url_2100: string;
    data_release_date: Date;
    initial_price_date: Date;
    data_effective_date: Date;
    comment: string;
    is_new: number;
    created_at?: Date;
    updated_at?: Date;
}