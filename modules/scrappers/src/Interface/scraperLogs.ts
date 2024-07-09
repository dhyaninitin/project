export default interface ScraperLogsInterface {
    id: number;
    content: Text;
    status: string;
    status_type:number;
    is_running:number;
    scraper_type?:number;
    created_at?: Date;
    updated_at?: Date;
}