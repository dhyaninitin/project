export interface CreateOffer {
    templateid: string;
    templatename?: string;
    description?: string;
    sendoffer?: string;
    isActive?: number;
    templatetype?: string;
    componenttype: string;
    offercustomfield: Array<any>;
    offerdocument?: DocumentDetail;
}

interface DocumentDetail {
    documentname?: string;
    documentoriginalname?: string;
    extension?: string;
    documentpath?: string;
    size?: string;
 }